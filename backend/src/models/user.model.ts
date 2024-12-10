import { User } from "../types/user";
import { v4 as uuidv4 } from 'uuid'

class UserModel {
  private users: User[] = []

  findAll(): User[] {
    return this.users
  }

  findById(id: string): User | undefined {
    const user = this.users.find(user => user.id === id)
    if (!user) return undefined
    return user
  }

  findByUsername(username: string): User | undefined {
    const user = this.users.find(user => user.username === username)
    if (!user) return undefined
    return user
  }

  create(newData: Omit<User, 'id'>): User {
    const user = {
      id: uuidv4(),
      ...newData
    }
    this.users.push(user)
    return user
  }

  edit(id: string, newData: Partial<User>): User | undefined {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return undefined
    const updatedUser = {
      ...this.users[index],
      ...newData
    }
    this.users[index] = updatedUser
    return updatedUser
  }

  delete(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return false
    this.users.splice(index, 1)
    return true
  }
}

export default new UserModel