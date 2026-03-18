import { loadImage } from "canvas";

class ImageManager {
    public async imageTo2DArray(path: string): Promise<void> {
        const img = await loadImage(path);
        console.log('img:', img);
    }
}

export default new ImageManager;
