
export interface TemplateResult<T> {
    element: HTMLElement;
    methods: T;
}

export function Component<T, U>(
    View: (initialBindings ?: any) => TemplateResult<T>,
    controllerBody ?: (methods, services ?: U) => void,
    initialBindings ?: (services ?: U) => any
){
    return (services : U) => {
        return (...children: HTMLElement[]) => {
            let _initialBindings = initialBindings ? initialBindings(services) : null;
            let template = View(_initialBindings);

            if (controllerBody) { 
                controllerBody(template.methods, services);
            }

            children.forEach((child) => {
                template.element.appendChild(child);
            });

            return template.element;
        };
    }
}   
