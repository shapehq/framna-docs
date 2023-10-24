export function getProjectId(url?: string) {
    if (typeof window !== 'undefined') {
        url = window.location.pathname;// remove first slash
    }
    url = url?.substring(1);// remove first slash
    const firstSlash = url?.indexOf('/');
    let project = url ? decodeURI(url) : undefined
    if (firstSlash != -1 && url) {
        project = decodeURI(url.substring(0, firstSlash));
    }
    return project
}

function getVersionAndSpecification(url?: string) {
<<<<<<<< HEAD:src/common/UrlUtils.ts
    const project = getProjectId(url)?.replace('-openapi', '');
========
    const project = getProjectId(url)
>>>>>>>> develop:src/common/utils/url.ts
    if (url && project) {
        const versionAndSpecification = url.substring(project.length + 2)// remove first slash
        let specification: string | undefined = undefined;
        let version = versionAndSpecification;
        if (versionAndSpecification) {
            const lastSlash = versionAndSpecification?.lastIndexOf('/');
            if (lastSlash != -1) {
                const potentialSpecification = versionAndSpecification?.substring(lastSlash)
                if (potentialSpecification?.endsWith('.yml') || potentialSpecification?.endsWith('.yaml')) {
                    version = versionAndSpecification?.substring(0, lastSlash)
                    specification = versionAndSpecification?.substring(lastSlash + 1)
                }
            }
        }
        return {
            version,
            specification
        };
    }
    return {};
}

export function getVersionId(url?: string) {
    if (typeof window !== 'undefined') {
        url = window.location.pathname
    }
    const version = getVersionAndSpecification(url).version;
    return version ? decodeURI(version) : undefined;
}

export function getSpecificationId(url?: string) {
    if (typeof window !== 'undefined') {
        url = window.location.pathname
    }
    const specification = getVersionAndSpecification(url).specification;
    return specification ? decodeURI(specification) : undefined;
}