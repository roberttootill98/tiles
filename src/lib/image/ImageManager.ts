
type Colour = {
    red: number;
    green: number;
    blue: number;
};

type ImageLoadData = {
    pixels: Colour[][];
    palette: Colour[];
};

class ImageManager {
    public async loadImage(file: File): Promise<void> {
        const { pixels, palette } = await this.imageTo2DArray(file);
        console.log(`${palette.length} colours found!`);
    }

    //#region load image

    private async imageTo2DArray(file: File): Promise<ImageLoadData> {
        const img: HTMLImageElement = new Image();

        const url: string = URL.createObjectURL(file);
        img.src = url;

        await this.loadImageAsync(img);

        const { pixels, palette } = this.readInHtmlImgElement(img);
        
        URL.revokeObjectURL(url);
        
        return { pixels, palette };
    }

    private loadImageAsync(img: HTMLImageElement): Promise<void> {
        return new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = (err) => reject(err);
        });
    }
    
    private readInHtmlImgElement(img: HTMLImageElement): ImageLoadData {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, img.width, img.height).data;

        const pixels: Colour[][] = [];
        const palette: Colour[] = [];

        for (let y = 0; y < img.height; y++) {
            const row: Colour[] = [];

            for (let x = 0; x < img.width; x++) {
                const idx = (y * img.width + x) * 4;

                const colour = {
                    red: data[idx],
                    green: data[idx + 1],
                    blue: data[idx + 2]
                };

                // add to pixels
                row.push(colour);

                //#region check for new colour
                const found: boolean = palette.find((colour_search: Colour) => {
                    return (
                        colour.red == colour_search.red &&
                        colour.green == colour_search.green &&
                        colour.blue == colour_search.blue
                    );
                }) != null;
                
                if(!found) {
                    palette.push(colour);
                }

                //#endregion check for new colour
            }

            pixels.push(row);
        }

        return { pixels, palette};
    };

    //#endregion load image
}

const instance = new ImageManager;

export default instance;
