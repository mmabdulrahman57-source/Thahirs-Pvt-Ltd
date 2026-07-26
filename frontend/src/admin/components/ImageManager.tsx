import { useRef, useState } from 'react';
import { Link2, Upload, Star, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminUploadImage } from '../api';

export interface ProductImages {
  image: string;
  images: string[];
}

interface ImageManagerProps {
  value: ProductImages;
  onChange: (value: ProductImages) => void;
}

function resolveSrc(url: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/')) return url;
  return `/${url}`;
}

export default function ImageManager({ value, onChange }: ImageManagerProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allImages = value.images.length ? value.images : value.image ? [value.image] : [];

  const sync = (images: string[], primary?: string) => {
    const cleaned = images.filter(Boolean);
    const main = primary && cleaned.includes(primary) ? primary : cleaned[0] || '';
    onChange({ image: main, images: cleaned });
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return toast.error('Enter an image URL');
    try {
      new URL(url.startsWith('/') ? `http://localhost${url}` : url);
    } catch {
      return toast.error('Enter a valid URL');
    }
    if (allImages.includes(url)) return toast.error('Image already added');
    sync([...allImages, url]);
    setUrlInput('');
    toast.success('Image added');
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const { url } = await adminUploadImage(file);
        added.push(url);
      }
      if (added.length) {
        sync([...allImages, ...added]);
        toast.success(`${added.length} image(s) uploaded`);
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const setPrimary = (url: string) => {
    const rest = allImages.filter(i => i !== url);
    sync([url, ...rest], url);
    toast.success('Primary image updated');
  };

  const remove = (url: string) => {
    sync(allImages.filter(i => i !== url));
  };

  return (
    <div className="md:col-span-2 border border-steel/15 rounded-xl p-4 bg-steel/5">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold flex items-center gap-2">
          <ImageIcon size={16} className="text-primary" /> Product Images
        </label>
        <span className="text-xs text-charcoal/50">{allImages.length} image{allImages.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'url' ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/20'}`}>
          <Link2 size={13} /> Image URL
        </button>
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/20'}`}>
          <Upload size={13} /> Upload Image
        </button>
      </div>

      {mode === 'url' ? (
        <div className="flex gap-2 mb-4">
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="https://example.com/product-image.jpg"
            className="input-field text-sm flex-1" />
          <button type="button" onClick={addUrl} className="btn-primary text-sm py-2 px-4 whitespace-nowrap">Add URL</button>
        </div>
      ) : (
        <div className="mb-4">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleUpload(e.target.files)} />
          <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-steel/30 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-charcoal/40" />}
            <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
            <span className="text-xs text-charcoal/50">JPG, PNG, GIF, WebP — max 5MB each</span>
          </button>
        </div>
      )}

      {allImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allImages.map(url => {
            const isPrimary = url === value.image || (!value.image && url === allImages[0]);
            return (
              <div key={url} className={`relative group rounded-lg overflow-hidden border-2 ${isPrimary ? 'border-primary' : 'border-steel/20'}`}>
                <img src={resolveSrc(url)} alt="" className="w-full h-24 object-cover bg-steel/10"
                  onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23eee" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="10">Error</text></svg>'; }} />
                {isPrimary && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded font-semibold flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" /> Primary
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {!isPrimary && (
                    <button type="button" onClick={() => setPrimary(url)} title="Set as primary"
                      className="p-1.5 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-colors">
                      <Star size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => remove(url)} title="Remove"
                    className="p-1.5 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-charcoal/50 text-center py-4">No images yet. Add a URL or upload a file.</p>
      )}

      {value.image && (
        <p className="text-xs text-charcoal/50 mt-3 truncate">Primary: {value.image}</p>
      )}
    </div>
  );
}
