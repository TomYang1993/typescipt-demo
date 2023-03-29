
import {Project, ProjectStatus} from "../models/project.js"

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

export const globalState = GlobalState.getInstance();
