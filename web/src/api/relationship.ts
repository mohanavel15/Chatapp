import Routes from "../config"
import { Relationship } from "../models/relationship"

export async function GetRelationships() {
    const response = await fetch(Routes.Relationships)

    if (!response.ok) {
        return [] as Relationship[]
    }

    const relationships: Relationship[] = await response.json()
    return relationships
}

export async function GetRelationship(id: string) {
    const url = Routes.Relationships + "/" + id
    const response = await fetch(url)

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}

export async function RelationshipToDefault(id: string) {
    const url = Routes.Relationships + "/" + id + "/default"
    const response = await fetch(url, {
        method: "PUT",
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}

export async function RelationshipToFriend(id: string) {
    const url = Routes.Relationships + "/" + id + "/friend"
    const response = await fetch(url, {
        method: "PUT",
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}

export async function RelationshipToBlock(id: string) {
    const url = Routes.Relationships + "/" + id + "/block"
    const response = await fetch(url, {
        method: "PUT",
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}
