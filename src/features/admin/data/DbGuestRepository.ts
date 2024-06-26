import { IDB } from "@/common"
import { Guest, IGuestRepository } from "../domain"

export default class DbGuestRepository implements IGuestRepository {
    private readonly db: IDB

    constructor(config: { db: IDB }) {
        this.db = config.db
    }
    
    /**
     * Uses users table owned by Authjs to determine if a guest is active = there's a user with the same email
     * 
     * @returns all guests including their status
     */
    async getAll(): Promise<Guest[]> {
        const sql = `
            SELECT  
                g.*,
                CASE 
                    WHEN u.email IS NULL THEN 'invited'
                    ELSE 'active'
                END as status
            FROM guests g 
            LEFT JOIN users u ON g.email = u.email 
            ORDER BY g.email ASC
        `
        const result = await this.db.query<Guest>(sql)
        return result.rows
    }

    /**
     * Find a guest by email
     * 
     * @param email Email of the guest
     * @returns The guest or undefined if not found
     */
    async findByEmail(email: string): Promise<Guest | undefined> {
        const sql = "SELECT * FROM guests WHERE email = $1"
        const result = await this.db.query<Guest>(sql, [email])
        return result.rows[0]
    }

    /**
     * Create a guest
     * 
     * @param email Email of the guest
     * @param projects List of projects the guest should be associated with
     * @returns Newly created guest
     */
    async create(email: string, projects: string[]): Promise<Guest> {
        const sql = "INSERT INTO guests (email, projects) VALUES ($1, $2)"
        await this.db.query(sql, [email, JSON.stringify(projects)])
        
        const insertedGuest = await this.findByEmail(email)
        if (!insertedGuest) {
            throw new Error("Guest not found after insert")
        }
        
        return insertedGuest
    }

    /**
     * Remove a guest by email
     * 
     * @param email Email of the guest
     */
    async removeByEmail(email: string): Promise<void> {
        const sql = "DELETE FROM guests WHERE email = $1"
        await this.db.query(sql, [email])
    }
    
    /**
     * Get projects for a guest
     * 
     * @param email Email of the guest
     * @returns The projects the guest is associated with. If the guest is not found, an empty array is returned.
     */
    async getProjectsForEmail(email: string): Promise<string[]> {
        const sql = "SELECT projects FROM guests WHERE email = $1"
        const result = await this.db.query(sql, [email])
        return result.rows[0] ? result.rows[0].projects : []
    }
}
