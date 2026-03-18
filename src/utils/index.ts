


export function createPageUrl(pageName: string) {
    // Special case: Home maps to root "/"
    if (pageName === 'Home') return '/';
    // Preserve original casing so routes like /Library, /Profile, /Community match
    // the Route definitions in App.jsx (which use the page name as-is).
    return '/' + pageName.replace(/ /g, '-');
}