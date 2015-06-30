
export interface TemplateResult<T> {
    element: HTMLElement;
    methods: T;
}

/**
 * Function for creating a reusable component to render HTML based off of a given View and Controller.
 *
 * Returns a function to be called with a 'services context' which will be injected to the controller and initial bindings. 
 * This function is a factory to create an HTMLElement with any given children added as children of the element.
 *
 * Example usage:
 *     let UncompiledComponent = Component<ViewUpdateFunctionsType, ServicesType>(View, Controller, initialBindings);
 *     let CompiledComponentFactory = UncompiledComponent(services);
 *     let renderedHTML = CompiledComponentFactory();
 *     let renderedHTMLWithChildren = CompiledComponentFactory(CompiledComponentFactory(), CompiledComponentFactory());
 */
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

            children.filter((child) => {
                return child != null;
            }).forEach((child) => {
                template.element.appendChild(child);
            });

            return template.element;
        };
    }
}   
