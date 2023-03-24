import {Vec2} from './types.util'

export function parseVec2(s: string): Vec2 | null {
    const vec = s.split(' ').map(s => parseInt(s))
    if (vec.length <= 2 && (isNaN(vec[0]) || isNaN(vec[1]))) return null
    return {x: vec[0], z: vec[1]}
}

export function randomVec2(min: Vec2, max: Vec2,): Vec2 {
    return {
        x: Math.floor(Math.random() * (max.x - min.x + 1) + min.x),
        z: Math.floor(Math.random() * (max.z - min.z + 1) + min.z),
    }
}

export function clamp(min: number, num: number, max: number): number {
    return Math.min(Math.max(num, min), max)
}
