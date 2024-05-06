import Guest from "./Guest"

export default interface IGuestRepository {
    getAll(): Promise<Guest[]>
    findByEmail(email: string): Promise<Guest | undefined>
    create(email: string, projects: string[]): Promise<Guest>
    removeByEmail(email: string): Promise<void>
    getProjectsForEmail(email: string): Promise<string[]>
}
