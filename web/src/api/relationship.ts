import Routes from "../config"
import { Relationship } from "../models/relationship"

export async function GetRelationships(access_token: string) {
    const response = await fetch(Routes.Relationships, {
        method: "GET",
        headers: {
            "Authorization": access_token,
        }
    })

    if (!response.ok) {
        return [] as Relationship[]
    }

    const relationships: Relationship[] = await response.json()
    return relationships
}

export async function GetRelationship(access_token: string, id: string) {
    const url = Routes.Relationships + "/" + id
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": access_token,
        }
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}

export async function RelationshipToDefault(access_token: string, id: string) {
    const url = Routes.Relationships + "/" + id + "/default"
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": access_token,
        }
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}

export async function RelationshipToFriend(access_token: string, id: string) {
    const url = Routes.Relationships + "/" + id + "/friend"
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": access_token,
        }
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}

export async function RelationshipToBlock(access_token: string, id: string) {
    const url = Routes.Relationships + "/" + id + "/block"
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": access_token,
        }
    })

    if (!response.ok) {
        return {} as Relationship
    }
    
    const relationship: Relationship = await response.json()
    return relationship
}
