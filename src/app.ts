// autobind
function autobind(_:any, _2: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjustedDescriptor;
}

// validation service
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(input: Validatable) {
    let isValid = true
    if(input.required){
        isValid = isValid && (input.value.toString().trim().length !== 0)
    } 
    if(input.minLength != null && typeof input.value === 'string'){
        isValid = isValid && input.value.length > input.minLength
    }
    if(input.maxLength != null && typeof input.value === 'string'){
        isValid = isValid && input.value.length < input.maxLength
    }
    if(input.min != null && typeof input.value === 'number'){
        isValid = isValid && input.value > input.min
    }
    if(input.max != null && typeof input.value === 'number'){
        isValid = isValid && input.value < input.max
    }
    return isValid;
}


class ProjectList {

    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;

    // now type is class property, needs to be accessed by this.type.
    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}


class ProjectInput {

    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }

    private gatherUserInput():[string, string, number] | void {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;

        const titleValidator: Validatable = {
            value: title,
            required: true
        }

        const descriptionValidator: Validatable = {
            value: description,
            required: true,
            minLength: 5,
        }

        const peopleValidator: Validatable = {
            value: +people,
            required: true,
            min:1,
            max:5
        }

        //validation
        if(!validate(titleValidator)||!validate(descriptionValidator)||!validate(peopleValidator)){
            alert("wrong!!!")
            return;
        }else{
            return [title, description, +people]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';

    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if(Array.isArray(userInput)){
            const [title, description, people] = userInput;
            console.log(title, description, people)
            this.clearInputs();
        }

    }

    private configure(){
        this.element.addEventListener('submit', this.submitHandler);
    }

}


const app = new ProjectInput();
const activeLists = new ProjectList('active');
const finishedLists = new ProjectList('finished');