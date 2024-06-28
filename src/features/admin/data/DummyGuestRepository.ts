import { Guest, IGuestRepository } from "../domain"

/**
 * This is a dummy implementation of the guest repository that returns stati data.
 * 
 * It is used in the NextJS build process where pages are prerendered and where we do not
 * have access to a database.
 */
export default class DummyGuestRepository implements IGuestRepository {
    getAll(): Promise<Guest[]> {
        return Promise.resolve([])
    }
    findByEmail(email: string): Promise<Guest | undefined> {
        throw new Error("Method not implemented.");
    }
    create(email: string, projects: string[]): Promise<Guest> {
        throw new Error("Method not implemented.");
    }
    removeByEmail(email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getProjectsForEmail(email: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
}
