import { Injectable, InternalServerErrorException } from "@nestjs/common"
import type { Repository } from "typeorm"
import  { Producer } from "./entities/producer.entity"
import type { CreateProducerDto } from "./dto/create-producer.dto"
import type { UpdateProducerDto } from "./dto/update-producer.dto"
import aqp from "api-query-params"
import type { IUser } from "../users/interface/user.interface"
import  { Film } from "src/modules/films/entities/film.entity"
import  { FilmProducer } from "src/modules/film_producer/entities/film_producer.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
    @InjectRepository(FilmProducer)
    private readonly filmProducerRepo: Repository<FilmProducer>,
    @InjectRepository(Film)
    private readonly filmRepo: Repository<Film>,
  ) {}

  async createProducer(dto: CreateProducerDto, user: IUser): Promise<any> {
    try {
      if (!dto.producerName?.trim()) {
        return { EC: 0, EM: "Producer name is required!" }
      }

      const exists = await this.producerRepo.findOne({
        where: { producerName: dto.producerName },
      })
      if (exists) return { EC: 0, EM: "Producer name already exists!" }
      const slug = dto.producerName.toLowerCase().replace(/\s+/g, "-")
      const producer = this.producerRepo.create({
        producerName: dto.producerName,
        slug: slug,
        createdBy: user.userId,
      })

      const data = await this.producerRepo.save(producer)
      return {
        EC: 1,
        EM: "Create producer successfully",
        ...data,
      }
    } catch (error: any) {
      console.error("Error in createProducer:", error)
      throw new InternalServerErrorException({
        EC: 0,
        EM: "Error from createProducer service",
      })
    }
  }

  async getAllProducers(query: any): Promise<any> {
    try {
      const { filter, sort } = aqp(query)
      const page = query.page || 1
      const limit = query.limit || 5
      const skip = (page - 1) * limit

      delete filter.page
      delete filter.limit
      delete filter.skip
      delete filter.sort

      const order = sort || { producerId: "ASC" }

      const [data, total] = await this.producerRepo.findAndCount({
        where: filter,
        order,
        skip,
        take: limit,
      })

      if (total === 0)
        return {
          EC: 1,
          EM: "No producers found!",
          meta: { page, limit, total, totalPages: 0 },
        }

      const producers = data.map((d) => {
        const { createdAt, updatedAt, createdBy, ...newData } = d as any
        return Object.fromEntries(
          Object.entries({
            ...newData,
            slug: d.slug,
          }).filter(([_, v]) => v !== null),
        )
      })

      return {
        EC: 1,
        EM: "Get all producers successfully",
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        producers,
      }
    } catch (error: any) {
      console.error("Error in getAllProducers:", error)
      throw new InternalServerErrorException({
        EC: 0,
        EM: "Error from getAllProducers service",
      })
    }
  }

  async getProducerById(id: number): Promise<any> {
    try {
      const producer = await this.producerRepo.findOne({
        where: { producerId: id },
      })

      if (!producer) return { EC: 0, EM: `Producer ${id} not found!` }

      const { createdAt, updatedAt, createdBy, ...newData } = producer as any
      Object.entries(newData)
        .filter(([_, v]) => v === null || v === undefined)
        .forEach(([k]) => delete newData[k])

      return {
        EC: 1,
        EM: "Get producer successfully",
        ...newData,
      }
    } catch (error: any) {
      console.error("Error in getProducerById:", error)
      throw new InternalServerErrorException({
        EC: 0,
        EM: "Error from getProducerById service",
      })
    }
  }

  async updateProducer(id: number, dto: UpdateProducerDto, user: IUser): Promise<any> {
    try {
      const producer = await this.producerRepo.findOne({
        where: { producerId: id },
      })

      if (!producer) return { EC: 0, EM: `Producer ${id} not found!` }

      if (dto.producerName) {
        const exists = await this.producerRepo.findOne({
          where: { producerName: dto.producerName },
        })
        if (exists && exists.producerId !== id) return { EC: 0, EM: "Producer name already exists!" }

        producer.producerName = dto.producerName
        producer.slug = dto.producerName.toLowerCase().replace(/\s+/g, "-")
      }

      producer.updatedBy = user.userId
      const data = await this.producerRepo.save(producer)

      return {
        EC: 1,
        EM: "Update producer successfully",
        ...data,
      }
    } catch (error: any) {
      console.error("Error in updateProducer:", error)
      throw new InternalServerErrorException({
        EC: 0,
        EM: "Error from updateProducer service",
      })
    }
  }

  async deleteProducerById(producerId: number, user: IUser): Promise<any> {
    try {
      const producer = await this.producerRepo.findOne({
        where: { producerId },
      })
      if (!producer) return { EC: 0, EM: `Producer ${producerId} not found!` }

      await this.producerRepo.update(producerId, { deletedBy: user.userId })
      await this.producerRepo.softDelete({ producerId })

      return { EC: 1, EM: "Delete producer successfully" }
    } catch (error: any) {
      console.error("Error in deleteProducerById:", error)
      throw new InternalServerErrorException({
        EC: 0,
        EM: "Error from deleteProducerById service",
      })
    }
  }

  async getFilmsByProducerId(producerId: number, query: any): Promise<any> {
    try {
      const producer = await this.producerRepo.findOne({
        where: { producerId },
      })

      if (!producer) return { EC: 0, EM: `Producer ${producerId} not found!` }

      const { filter, sort } = aqp(query)
      const page = query.page || 1
      const limit = query.limit || 10
      const skip = (page - 1) * limit

      delete filter.page
      delete filter.limit
      delete filter.skip

      const order = sort || { filmId: "DESC" }

      const [filmProducers, total] = await this.filmProducerRepo.findAndCount({
        where: { producer: { producerId }, ...filter },
        relations: ["film"],
        order,
        skip,
        take: limit,
      })

      if (total === 0)
        return {
          EC: 1,
          EM: "No films found for this producer!",
          meta: { page, limit, total, totalPages: 0 },
          films: [],
        }

      const films = filmProducers.map((fp) => fp.film)

      return {
        EC: 1,
        EM: "Get films by producer successfully",
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        films,
      }
    } catch (error: any) {
      console.error("Error in getFilmsByProducerId:", error)
      throw new InternalServerErrorException({
        EC: 0,
        EM: "Error from getFilmsByProducerId service",
      })
    }
  }
}
