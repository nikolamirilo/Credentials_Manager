// index.js (main server file)

// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Node.js built-in crypto module

// --- Initial Configuration ---

// Initialize Express app
const app = express();

// Enable CORS for all origins (for frontend integration)
app.use(cors());

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Get environment variables
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ENCRYPTION_KEY_BASE64 = process.env.ENCRYPTION_KEY; // Base64 encoded key

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ENCRYPTION_KEY_BASE64) {
    console.error('Error: Missing required environment variables. Please check your .env file.');
    process.exit(1); // Exit the process if essential variables are missing
}

// Derive encryption key from base64 string
let ENCRYPTION_KEY;
try {
    ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_BASE64, 'base64');
    if (ENCRYPTION_KEY.length !== 32) { // AES-256 requires a 32-byte key
        throw new Error('Encryption key must be 32 bytes (256 bits) for AES-256.');
    }
} catch (error) {
    console.error('Error processing ENCRYPTION_KEY:', error.message);
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Utility Functions for Encryption/Decryption ---

const ALGORITHM = 'aes-256-cbc'; // AES 256-bit in CBC mode

/**
 * Encrypts a given text using AES-256-CBC.
 * @param {string} text - The text to encrypt.
 * @returns {object} An object containing the encrypted text (content) and the initialization vector (iv) in hex format.
 */
function encrypt(text) {
    const iv = crypto.randomBytes(16); // Generate a random 16-byte IV for CBC mode
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), content: encrypted };
}

/**
 * Decrypts a given encrypted text using AES-256-CBC.
 * @param {string} encryptedText - The encrypted text in hex format.
 * @param {string} ivHex - The initialization vector in hex format.
 * @returns {string} The decrypted text.
 */
function decrypt(encryptedText, ivHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


// --- Routes ---

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Credentials Manager API!' });
});

// --- User Management Routes ---

/**
 * @route POST /users/register
 * @description Register a new user
 * @body {string} email - User's email address (must be unique)
 * @body {string} password - User's password (will be hashed)
 * @returns {object} { message: "User registered" } on success
 * @returns {object} Error message on failure (e.g., 400, 422, 500)
 */
app.post('/users/register', async (req, res) => {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user into Supabase 'users' table
        const { data, error } = await supabase
            .from('users')
            .insert([
                { email, password_hash: passwordHash }
            ])
            .select(); // Use .select() to get the inserted data back

        if (error) {
            // Handle unique constraint violation for email
            if (error.code === '23505' && error.constraint === 'users_email_key') {
                return res.status(400).json({ message: 'Email already registered.' });
            }
            console.error('Supabase registration error:', error);
            return res.status(500).json({ message: 'Internal Server Error', detail: error.message });
        }

        res.status(201).json({ message: 'User registered' });

    } catch (err) {
        console.error('Server error during registration:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route POST /users/login
 * @description Login a user
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @returns {object} { user_id: "uuid" } on successful login
 * @returns {object} Error message on failure (e.g., 401, 422, 500)
 */
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Retrieve user from Supabase
        const { data, error } = await supabase
            .from('users')
            .select('id, password_hash')
            .eq('email', email)
            .single(); // Use .single() to expect one row or null

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Supabase login query error:', error);
            return res.status(500).json({ message: 'Internal Server Error', detail: error.message });
        }

        if (!data) {
            // No user found with that email
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, data.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ user_id: data.id });

    } catch (err) {
        console.error('Server error during login:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route GET /users/user
 * @description Get current user info (placeholder)
 * @returns {object} { message: "Current user endpoint - authentication needed" }
 */
app.get('/users/user', (req, res) => {
    // In a real application, this would require an authentication middleware
    // to verify a JWT token and return the user's details.
    res.status(200).json({ message: 'Current user endpoint - authentication needed' });
});

/**
 * @route GET /users/all
 * @description Get all users (for demonstration, in production this would be admin-only)
 * @returns {Array<object>} List of all users (id, email)
 * @returns {object} Error message on failure (e.g., 500)
 */
app.get('/users/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, created_at'); // Select specific columns

        if (error) {
            console.error('Supabase get all users error:', error);
            return res.status(500).json({ message: 'Internal Server Error', detail: error.message });
        }

        res.status(200).json(data);

    } catch (err) {
        console.error('Server error getting all users:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

// --- Vault Management Routes ---

/**
 * @route POST /vaults
 * @description Create a new vault
 * @body {string} user_id - UUID of the user creating the vault
 * @body {string} name - Name of the vault
 * @returns {object} { message: "Vault created" } on success
 * @returns {object} Error message on failure (e.g., 400, 401, 422, 500)
 */
app.post('/vaults', async (req, res) => {
    const { user_id, name } = req.body;

    // Basic input validation
    if (!user_id || !name) {
        return res.status(400).json({ message: 'User ID and vault name are required.' });
    }

    // Optional: Validate user_id exists in 'users' table (more robust in production)
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user_id)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Supabase user validation error:', userError);
            return res.status(500).json({ message: 'Internal Server Error', detail: userError.message });
        }

        if (!userData) {
            return res.status(401).json({ message: 'Unauthorized - Invalid user ID' });
        }

        // Insert new vault
        const { data: vaultData, error: vaultError } = await supabase
            .from('vaults')
            .insert([
                { user_id, name }
            ])
            .select();

        if (vaultError) {
            console.error('Supabase vault creation error:', vaultError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultError.message });
        }

        res.status(201).json({ message: 'Vault created', vault_id: vaultData[0].id });

    } catch (err) {
        console.error('Server error during vault creation:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route GET /vaults
 * @description List user's vaults
 * @query {string} user_id - UUID of the user whose vaults to retrieve
 * @returns {Array<object>} List of vaults with details (id, user_id, name, created_at)
 * @returns {object} Error message on failure (e.g., 400, 401, 422, 500)
 */
app.get('/vaults', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID query parameter is required.' });
    }

    try {
        // Optional: Validate user_id exists in 'users' table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user_id)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Supabase user validation error:', userError);
            return res.status(500).json({ message: 'Internal Server Error', detail: userError.message });
        }

        if (!userData) {
            return res.status(401).json({ message: 'Unauthorized - Invalid user ID' });
        }

        // Retrieve vaults for the given user_id
        const { data: vaultsData, error: vaultsError } = await supabase
            .from('vaults')
            .select('id, user_id, name, created_at')
            .eq('user_id', user_id);

        if (vaultsError) {
            console.error('Supabase get vaults error:', vaultsError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultsError.message });
        }

        res.status(200).json(vaultsData);

    } catch (err) {
        console.error('Server error getting user vaults:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route DELETE /vaults/:vault_id
 * @description Delete a vault and all its associated credentials
 * @param {string} vault_id - UUID of the vault to delete
 * @query {string} user_id - UUID of the user (for authorization)
 * @returns {object} { message: "Vault and associated credentials deleted", deletedCredentials: number } on success
 * @returns {object} Error message on failure (e.g., 400, 401, 404, 500)
 */
app.delete('/vaults/:vault_id', async (req, res) => {
    const { vault_id } = req.params;
    const { user_id } = req.query;

    // Basic input validation
    if (!vault_id || !user_id) {
        return res.status(400).json({ message: 'Vault ID and user ID are required.' });
    }

    try {
        // Validate if vault exists and belongs to the user
        const { data: vaultData, error: vaultError } = await supabase
            .from('vaults')
            .select('id, user_id')
            .eq('id', vault_id)
            .single();

        if (vaultError && vaultError.code !== 'PGRST116') {
            console.error('Supabase vault validation error:', vaultError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultError.message });
        }

        if (!vaultData) {
            return res.status(404).json({ message: 'Not Found - Vault not found' });
        }

        // Check if the vault belongs to the requesting user
        if (vaultData.user_id !== user_id) {
            return res.status(401).json({ message: 'Unauthorized - You can only delete your own vaults' });
        }

        // First, delete all credentials associated with this vault
        const { data: deletedCredentials, error: credentialsDeleteError } = await supabase
            .from('credentials')
            .delete()
            .eq('vault_id', vault_id)
            .select(); // Get deleted records to count them

        if (credentialsDeleteError) {
            console.error('Supabase credentials deletion error:', credentialsDeleteError);
            return res.status(500).json({ message: 'Internal Server Error', detail: credentialsDeleteError.message });
        }

        // Then, delete the vault itself
        const { data: deletedVault, error: vaultDeleteError } = await supabase
            .from('vaults')
            .delete()
            .eq('id', vault_id)
            .select();

        if (vaultDeleteError) {
            console.error('Supabase vault deletion error:', vaultDeleteError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultDeleteError.message });
        }

        res.status(200).json({ 
            message: 'Vault and associated credentials deleted', 
            deletedCredentials: deletedCredentials ? deletedCredentials.length : 0 
        });

    } catch (err) {
        console.error('Server error during vault deletion:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

// --- Credential Management Routes ---

/**
 * @route POST /credentials
 * @description Add a new credential to a vault
 * @body {string} vault_id - UUID of the vault
 * @body {string} username - Username for the credential
 * @body {string} password - Password for the credential (will be encrypted)
 * @body {string} [url] - Optional URL associated with the credential
 * @returns {object} { message: "Credential added" } on success
 * @returns {object} Error message on failure (e.g., 400, 401, 404, 422, 500)
 */
app.post('/credentials', async (req, res) => {
    const { vault_id, username, password, url } = req.body;

    // Basic input validation
    if (!vault_id || !username || !password) {
        return res.status(400).json({ message: 'Vault ID, username, and password are required.' });
    }

    try {
        // Validate if vault exists
        const { data: vaultData, error: vaultError } = await supabase
            .from('vaults')
            .select('id')
            .eq('id', vault_id)
            .single();

        if (vaultError && vaultError.code !== 'PGRST116') {
            console.error('Supabase vault validation error:', vaultError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultError.message });
        }

        if (!vaultData) {
            return res.status(404).json({ message: 'Not Found - Vault not found' });
        }

        // Encrypt the password
        const { iv, content: encryptedPassword } = encrypt(password);

        // Insert new credential
        const { data: credentialData, error: credentialError } = await supabase
            .from('credentials')
            .insert([
                { vault_id, username, password_encrypted: encryptedPassword, iv, url }
            ])
            .select();

        if (credentialError) {
            console.error('Supabase credential creation error:', credentialError);
            return res.status(500).json({ message: 'Internal Server Error', detail: credentialError.message });
        }

        res.status(201).json({ message: 'Credential added', credential_id: credentialData[0].id });

    } catch (err) {
        console.error('Server error during credential creation:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route GET /credentials/{vault_id}
 * @description List credentials in a vault
 * @param {string} vault_id - UUID of the vault to retrieve credentials from
 * @returns {Array<object>} List of credentials (id, vault_id, username, password_encrypted, iv, url, created_at)
 * @returns {object} Error message on failure (e.g., 400, 401, 404, 422, 500)
 */
app.get('/credentials/:vault_id', async (req, res) => {
    const { vault_id } = req.params;

    try {
        // Validate if vault exists
        const { data: vaultData, error: vaultError } = await supabase
            .from('vaults')
            .select('id')
            .eq('id', vault_id)
            .single();

        if (vaultError && vaultError.code !== 'PGRST116') {
            console.error('Supabase vault validation error:', vaultError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultError.message });
        }

        if (!vaultData) {
            return res.status(404).json({ message: 'Not Found - Vault not found' });
        }

        // Retrieve credentials for the given vault_id
        const { data: credentialsData, error: credentialsError } = await supabase
            .from('credentials')
            .select('id, vault_id, username, password_encrypted, iv, url, created_at')
            .eq('vault_id', vault_id);

        if (credentialsError) {
            console.error('Supabase get credentials error:', credentialsError);
            return res.status(500).json({ message: 'Internal Server Error', detail: credentialsError.message });
        }

        // Note: Passwords are returned encrypted. Client-side decryption is expected.
        res.status(200).json(credentialsData);

    } catch (err) {
        console.error('Server error getting vault credentials:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route DELETE /credentials/:credential_id
 * @description Delete a single credential
 * @param {string} credential_id - UUID of the credential to delete
 * @query {string} user_id - UUID of the user (for authorization)
 * @returns {object} { message: "Credential deleted" } on success
 * @returns {object} Error message on failure (e.g., 400, 401, 404, 500)
 */
app.delete('/credentials/:credential_id', async (req, res) => {
    const { credential_id } = req.params;
    const { user_id } = req.query;

    // Basic input validation
    if (!credential_id || !user_id) {
        return res.status(400).json({ message: 'Credential ID and user ID are required.' });
    }

    try {
        // Validate if credential exists and check ownership through vault
        const { data: credentialData, error: credentialError } = await supabase
            .from('credentials')
            .select(`
                id,
                vault_id,
                vaults!inner (
                    user_id
                )
            `)
            .eq('id', credential_id)
            .single();

        if (credentialError && credentialError.code !== 'PGRST116') {
            console.error('Supabase credential validation error:', credentialError);
            return res.status(500).json({ message: 'Internal Server Error', detail: credentialError.message });
        }

        if (!credentialData) {
            return res.status(404).json({ message: 'Not Found - Credential not found' });
        }

        // Check if the credential belongs to a vault owned by the requesting user
        if (credentialData.vaults.user_id !== user_id) {
            return res.status(401).json({ message: 'Unauthorized - You can only delete credentials from your own vaults' });
        }

        // Delete the credential
        const { data: deletedCredential, error: deleteError } = await supabase
            .from('credentials')
            .delete()
            .eq('id', credential_id)
            .select();

        if (deleteError) {
            console.error('Supabase credential deletion error:', deleteError);
            return res.status(500).json({ message: 'Internal Server Error', detail: deleteError.message });
        }

        res.status(200).json({ message: 'Credential deleted' });

    } catch (err) {
        console.error('Server error during credential deletion:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route POST /decrypt
 * @description Decrypts an encrypted password using the server-side key
 * @body {string} encryptedText - The encrypted password content in hex format.
 * @body {string} ivHex - The initialization vector in hex format.
 * @returns {object} { decryptedText: "plain text password" } on success
 * @returns {object} Error message on failure (e.g., 400, 500)
 */
app.post('/decrypt', (req, res) => {
    const { encryptedText, ivHex } = req.body;

    // Basic input validation
    if (!encryptedText || !ivHex) {
        return res.status(400).json({ message: 'Encrypted text and IV are required for decryption.' });
    }

    try {
        const decrypted = decrypt(encryptedText, ivHex);
        res.status(200).json({ decryptedText: decrypted });
    } catch (err) {
        console.error('Server error during decryption:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route POST /import-credentials
 * @description Import multiple credentials from a list (e.g., parsed from CSV)
 * @body {string} vaultId - UUID of the target vault
 * @body {Array<object>} credentials - Array of credential objects (username, password, url)
 * @returns {object} { message: string, importedCount: number } on success
 * @returns {object} Error message on failure (e.g., 400, 404, 500)
 */
app.post('/import-credentials', async (req, res) => {
    const { vaultId, credentials } = req.body;

    if (!vaultId || !Array.isArray(credentials) || credentials.length === 0) {
        return res.status(400).json({ message: 'Vault ID and a non-empty array of credentials are required.' });
    }

    try {
        // Validate if vault exists
        const { data: vaultData, error: vaultError } = await supabase
            .from('vaults')
            .select('id')
            .eq('id', vaultId)
            .single();

        if (vaultError && vaultError.code !== 'PGRST116') {
            console.error('Supabase vault validation error:', vaultError);
            return res.status(500).json({ message: 'Internal Server Error', detail: vaultError.message });
        }

        if (!vaultData) {
            return res.status(404).json({ message: 'Not Found - Vault not found' });
        }

        // Prepare data for insertion, including encryption
        const credentialsToInsert = credentials.map(cred => {
            // Ensure required fields are present for each credential object
            if (!cred.username || !cred.password) {
                 console.warn('Skipping credential due to missing username or password:', cred);
                 return null; // Skip this credential
            }
             const { iv, content: encryptedPassword } = encrypt(cred.password);
             return {
                 vault_id: vaultId,
                 username: cred.username,
                 password_encrypted: encryptedPassword,
                 iv: iv,
                 url: cred.url || null // Handle optional URL
             };
         }).filter(cred => cred !== null); // Remove any skipped credentials

         if (credentialsToInsert.length === 0) {
             return res.status(400).json({ message: 'No valid credentials found in the provided data after validation.' });
         }

        // Insert credentials into the database
        const { data: insertedData, error: insertError } = await supabase
            .from('credentials')
            .insert(credentialsToInsert)
            .select(); // Return inserted data to get the count

        if (insertError) {
            console.error('Supabase credentials import error:', insertError);
            return res.status(500).json({ message: 'Internal Server Error', detail: insertError.message });
        }

        res.status(201).json({ message: `Successfully imported ${insertedData.length} credentials.`, importedCount: insertedData.length });

    } catch (err) {
        console.error('Server error during credentials import:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

/**
 * @route PUT /credentials/:credential_id
 * @description Update a credential (username, password, url, or move to another vault)
 * @param {string} credential_id - UUID of the credential to update
 * @body {string} user_id - UUID of the user (for authorization)
 * @body {string} [username] - New username (optional)
 * @body {string} [password] - New password (optional, will be encrypted)
 * @body {string} [url] - New URL (optional)
 * @body {string} [vault_id] - New vault ID to move the credential (optional)
 * @returns {object} { message: "Credential updated" } on success
 * @returns {object} Error message on failure (e.g., 400, 401, 404, 500)
 */
app.put('/credentials/:credential_id', async (req, res) => {
    const { credential_id } = req.params;
    const { user_id, username, password, url, vault_id } = req.body;

    // Basic input validation
    if (!credential_id || !user_id) {
        return res.status(400).json({ message: 'Credential ID and user ID are required.' });
    }

    try {
        // Validate if credential exists and check ownership through vault
        const { data: credentialData, error: credentialError } = await supabase
            .from('credentials')
            .select(`
                id,
                vault_id,
                vaults!inner (
                    user_id
                )
            `)
            .eq('id', credential_id)
            .single();

        if (credentialError && credentialError.code !== 'PGRST116') {
            console.error('Supabase credential validation error:', credentialError);
            return res.status(500).json({ message: 'Internal Server Error', detail: credentialError.message });
        }

        if (!credentialData) {
            return res.status(404).json({ message: 'Not Found - Credential not found' });
        }

        // Check if the credential belongs to a vault owned by the requesting user
        if (credentialData.vaults.user_id !== user_id) {
            return res.status(401).json({ message: 'Unauthorized - You can only update credentials from your own vaults' });
        }

        // Prepare update object
        const updateObj = {};
        if (username !== undefined) updateObj.username = username;
        if (url !== undefined) updateObj.url = url;
        if (vault_id !== undefined) updateObj.vault_id = vault_id;
        if (password !== undefined) {
            const { iv, content: encryptedPassword } = encrypt(password);
            updateObj.password_encrypted = encryptedPassword;
            updateObj.iv = iv;
        }

        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({ message: 'No fields to update.' });
        }

        // Update the credential
        const { data: updatedCredential, error: updateError } = await supabase
            .from('credentials')
            .update(updateObj)
            .eq('id', credential_id)
            .select();

        if (updateError) {
            console.error('Supabase credential update error:', updateError);
            return res.status(500).json({ message: 'Internal Server Error', detail: updateError.message });
        }

        res.status(200).json({ message: 'Credential updated' });
    } catch (err) {
        console.error('Server error during credential update:', err);
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log('Supabase URL:', SUPABASE_URL ? 'Configured' : 'Not Configured');
});