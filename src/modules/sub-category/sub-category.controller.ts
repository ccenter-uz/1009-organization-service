import { Controller ,Post , Get,Put,Delete,Patch } from "@nestjs/common";
import { SubCategoryService } from "./sub-category.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { SubCategoryInterfaces } from "types/organization/sub-category/interface/sub-category-group.interface";
import { SubCategoryServiceCommands as Commands } from "types/organization/sub-category/commands";
import { SubCategoryCreateDto, SubCategoryFilterDto, SubCategoryUpdateDto } from "types/organization/sub-category";
import { DeleteDto, GetOneDto, LanguageRequestDto, ListQueryDto } from "types/global";

@Controller('sub-category')
export class SubCategoryController {
    constructor ( private readonly subCategoryService : SubCategoryService  ) {}

    @Post()
    @MessagePattern({cmd : Commands.CREATE })
    create(
        @Payload() data : SubCategoryCreateDto 
    ) : Promise<SubCategoryInterfaces.Response> {
        return this.subCategoryService.create(data)
    }

    @Get('all')
    @MessagePattern({cmd : Commands.GET_ALL_LIST})
    findAll(
        @Payload() data: SubCategoryFilterDto
    ): Promise<SubCategoryInterfaces.ResponseWithoutPagination> {
        return this.subCategoryService.findAll(data)
    }


    @Get('by-id')
    @MessagePattern({cmd : Commands.GET_BY_ID})
    findOne(
    @Payload() data: GetOneDto
    ): Promise<SubCategoryInterfaces.Response> {
        return this.subCategoryService.findOne(data)
    }

    @Put()
    @MessagePattern({cmd : Commands.UPDATE})
    update(
        @Payload() data : SubCategoryUpdateDto
    ): Promise<SubCategoryInterfaces.Response> {
        return this.subCategoryService.update(data)
    }

    @Delete()
    @MessagePattern({cmd : Commands.DELETE})
    remove(
        @Payload() data :DeleteDto
    )  : Promise<SubCategoryInterfaces.Response>{
        return this.subCategoryService.remove(data)
    }

    @Patch()
    @MessagePattern({cmd : Commands.RESTORE })
    restore(
        @Payload() data: GetOneDto
    ) : Promise<SubCategoryInterfaces.Response> {
        return this.subCategoryService.restore(data)
    }


}