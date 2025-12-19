import fs from "fs";
import path from "path";

async function getTemplateImages() {
    const templatesDir = path.join(process.cwd(), "public/templates");
    try {
        const files = await fs.promises.readdir(templatesDir);
        return files.filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file)).map(file => `/templates/${file}`);
    } catch (error) {
        return [];
    }
}

export default async function TemplatesPage() {
    const images = await getTemplateImages();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Templates Gallery</h1>
                <p className="text-muted-foreground">Available certificate backgrounds in public/templates folder.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                    <div key={img} className="border rounded-lg overflow-hidden group">
                        <div className="aspect-video relative bg-muted">
                            <img src={img} alt="Template" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                        </div>
                        <div className="p-2 text-xs text-center text-muted-foreground break-all">
                            {img.split('/').pop()}
                        </div>
                    </div>
                ))}

                {images.length === 0 && <p className="col-span-full text-muted-foreground">No templates found. Upload images to 'public/templates'.</p>}
            </div>
        </div>
    );
}
