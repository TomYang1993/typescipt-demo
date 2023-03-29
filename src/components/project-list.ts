import { autobind } from "../decorators/autobind.js";
import { DragTarget } from "../models/drag-drop.js";
import {Project, ProjectStatus} from "../models/project.js"
import { globalState } from "../state/global-state.js";
import {Component} from "./base-component.js"
import {ProjectItem} from "./project-item.js"

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
  