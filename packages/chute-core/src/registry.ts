import { $Contravariant } from '@castore/core'
import { Action } from './action'
import { BaseContext } from './base-context'
import { AggregateService } from './chute-app'

export type BaseRegistryMap<C extends BaseContext = BaseContext> = {
    action: Action
    aggregate: AggregateService<C>
}

export class Registry<
    C extends BaseContext = BaseContext,
    ServiceMap extends BaseRegistryMap<C> = BaseRegistryMap<C>
> {
    data: Map<keyof ServiceMap, ServiceMap[keyof ServiceMap][]> = new Map()

    register<Type extends keyof ServiceMap>(type: Type, service: ServiceMap[Type]) {
        if (!this.data.has(type)) {
            this.data.set(type, [])
        }
        this.data.get(type)!.push(service)
    }

    get<Type extends keyof ServiceMap>(type: Type): ServiceMap[Type][] {
        const services = this.data.get(type)
        return (services || []) as ServiceMap[Type][]
    }
}
