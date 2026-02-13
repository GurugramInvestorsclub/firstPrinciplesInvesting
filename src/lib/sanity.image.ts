import createImageUrlBuilder from "@sanity/image-url"
import { dataset, projectId } from "./sanity.client"

const imageBuilder = createImageUrlBuilder({
    projectId: projectId || "",
    dataset: dataset || "",
})

export const urlForImage = (source: any) => {
    return imageBuilder.image(source).auto("format").fit("max")
}

export const getImageDimensions = (image: any): { width: number; height: number } | null => {
    if (!image?.asset?._ref) {
        return null
    }

    const ref = image.asset._ref
    const dimensions = ref.split("-")[2]

    if (!dimensions) {
        return null
    }

    const [width, height] = dimensions.split("x").map(Number)

    if (!width || !height || isNaN(width) || isNaN(height)) {
        return null
    }

    return { width, height }
}
