import {CommonModule} from "@angular/common";
import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import {TgCommonModule} from "../../ts/modules/common/common.module";
import {TgCardsModule} from "../cards/cards.module";
import {TgComponentsModule} from "../components/components.module";
import {TgServicesModule} from "../services/services.module";
import {TgPipesModule} from "../pipes/pipes.module";
import {TgAttachmentsModule} from "../attachments/attachments.module";
import {DetailUserstoryPage} from "./detail-userstory.component";
import {DetailVoteButton} from "./components/detail-vote-button.component";
import {DetailRelatedTasks} from "./components/detail-related-tasks.component";
import {DetailRelatedTaskRow} from "./components/detail-related-task-row.component";
import {DetailCreatedByDisplay} from "./components/detail-created-by-display.component";
import {DetailCustomAttributesValues} from "./components/detail-custom-attributes-values.component";
import {DetailCustomAttributesValue} from "./components/detail-custom-attributes-value.component";
import {DetailHeader} from "./components/detail-header.component";
import {DetailStatusDisplay} from "./components/detail-status-display.component";
import {DetailStatusButton} from "./components/detail-status-button.component";
import {DetailEffects} from "./detail.effects";

@NgModule({
    declarations: [
        DetailUserstoryPage,
        DetailVoteButton,
        DetailHeader,
        DetailCreatedByDisplay,
        DetailCustomAttributesValues,
        DetailCustomAttributesValue,
        DetailRelatedTasks,
        DetailRelatedTaskRow,
        DetailStatusDisplay,
        DetailStatusButton,
    ],
    exports: [
        DetailUserstoryPage,
    ],
    imports: [
        CommonModule,
        TgCommonModule,
        TgCardsModule,
        TgComponentsModule,
        TgServicesModule,
        FormsModule,
        StoreModule,
        TranslateModule.forChild({}),
        TgPipesModule,
        TgAttachmentsModule,
        RouterModule.forChild([
            { path: "project/:slug/us/:ref", component: DetailUserstoryPage },
        ]),
        EffectsModule.run(DetailEffects),
    ],
    providers: [
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class DetailModule {}
