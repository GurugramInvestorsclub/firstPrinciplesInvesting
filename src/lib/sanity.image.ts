import createImageUrlBuilder from "@sanity/image-url"
import { dataset, projectId } from "./sanity.client"

const imageBuilder = createImageUrlBuilder({
    projectId: projectId || "",
    dataset: dataset || "",
})

export const urlForImage = (source: any) => {
    return imageBuilder.image(source).auto("format").fit("max")
}
