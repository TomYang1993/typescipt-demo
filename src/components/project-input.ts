
import {Component} from "./base-component.js"
import { Validatable, validate } from "../util/validation.js";
import { autobind } from "../decorators/autobind.js";
import { globalState } from "../state/global-state.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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