
interface IGuestRepository {
    getAll(): Promise<Guest[]>
    findById(id: string): Promise<Guest>
    create(guest: Guest): Promise<Guest>
    removeById(id: string): Promise<void>
}
