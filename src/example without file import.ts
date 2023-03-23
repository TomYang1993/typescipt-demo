// Drag and Drop interface
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// TYPES
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

// state management

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class GlobalState extends State<Project> {
  private projects: Project[] = [];
  private static instance: GlobalState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new GlobalState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    
    const project = this.projects.find(project => project.id === projectId);
    if(project && project.status !== newStatus){
        project.status = newStatus;
    }
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const globalState = GlobalState.getInstance();

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
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
  let isValid = true;
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0;
  }
  if (input.minLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length > input.minLength;
  }
  if (input.maxLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length < input.maxLength;
  }
  if (input.min != null && typeof input.value === "number") {
    isValid = isValid && input.value >= input.min;
  }
  if (input.max != null && typeof input.value === "number") {
    isValid = isValid && input.value < input.max;
  }
  return isValid;
}

// Component base

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if(this.project.people === 1){
        return "1 person";
    } else {
        return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent): void {
      event.dataTransfer!.setData('text/plain', this.project.id);
      event.dataTransfer!.effectAllowed = 'move';
  }


  dragEndHandler(_: DragEvent): void {
      
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragStartHandler)
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[] = [];

  // now type is class property, needs to be accessed by this.type.
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    globalState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
        event.preventDefault();
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.add('droppable');
    }
  }

  @autobind
  dropHandler(event: DragEvent): void {
      const projectId = event.dataTransfer!.getData('text/plain')

    globalState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.remove('droppable');
  }

  private renderProjects() {
    const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`);
    // rough react idea!!!
    listElement.innerHTML = "";
    for (const item of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, item);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent(): void {}

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    const titleValidator: Validatable = {
      value: title,
      required: true,
    };

    const descriptionValidator: Validatable = {
      value: description,
      required: true,
      minLength: 5,
    };

    const peopleValidator: Validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    //validation
    if (
      !validate(titleValidator) ||
      !validate(descriptionValidator) ||
      !validate(peopleValidator)
    ) {
      alert("wrong!!!");
      return;
    } else {
      return [title, description, +people];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      globalState.addProject(title, description, people);
      this.clearInputs();
    }
  }
}

const app = new ProjectInput();
const activeLists = new ProjectList("active");
const finishedLists = new ProjectList("finished");
