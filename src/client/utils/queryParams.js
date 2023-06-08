function getCurrentUrl () {
    return new URL(window.location)
}

export function getQueryParam (name) {
    const url = getCurrentUrl()
    return url.searchParams.get(name)
}

export function updateQueryParam (name, value) {
    const url = getCurrentUrl()
    const currentParamValue = getQueryParam(name)

    if (currentParamValue !== value) {
        url.searchParams.set(name, value)
        window.history.pushState({}, '', url)
    }
}