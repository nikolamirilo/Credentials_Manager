"use server"

export async function getData(url_params, options = {}) {
    try {
        const res = await fetch(`${process.env.BASE_URL}${url_params}`, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body || undefined,
            ...options
        })
        
        // Parse the response and return serializable data
        const data = await res.json()
        
        return {
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            data: data
        }
    }
    catch (error) {
        console.error('Server action error:', error)
        return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            data: { message: error.message || 'An error occurred' }
        }
    }
}