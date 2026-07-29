import { useRef, useState } from 'react';
import { Link2, Upload, Trash2, Loader2, User, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminUploadImage } from '../api';

export function resolvePhotoSrc(url: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/')) return url;
  return `/${url}`;
}

interface PhotoFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  uploadFolder?: 'products' | 'projects';
  placeholderIcon?: 'user' | 'image';
}

export default function PhotoField({ value, onChange, label = 'Photo', uploadFolder, placeholderIcon = 'user' }: PhotoFieldProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return toast.error('Enter an image URL');
    onChange(url);
    setUrlInput('');
    toast.success('Photo added');
  };

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file, uploadFolder);
      onChange(url);
      toast.success('Photo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="border border-steel/15 rounded-xl p-4 bg-steel/5">
      <label className="text-sm font-semibold mb-3 block">{label}</label>

      {value ? (
        <div className="relative w-32 h-32 mx-auto mb-4 group">
          <img
            src={resolvePhotoSrc(value)}
            alt=""
            className="w-full h-full rounded-xl object-cover border border-steel/20 bg-steel/10"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove photo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center border border-dashed border-steel/30">
          {placeholderIcon === 'image' ? (
            <ImageIcon size={40} className="text-primary/40" />
          ) : (
            <User size={40} className="text-primary/40" />
          )}
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/20'}`}
        >
          <Upload size={13} /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'url' ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/20'}`}
        >
          <Link2 size={13} /> URL
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files)} />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-steel/30 rounded-xl py-4 flex flex-col items-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <Upload size={20} className="text-charcoal/40" />}
            <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Choose image'}</span>
          </button>
        </>
      ) : (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="https://example.com/photo.jpg"
            className="input-field text-sm flex-1"
          />
          <button type="button" onClick={addUrl} className="btn-primary text-sm py-2 px-3 whitespace-nowrap">Set</button>
        </div>
      )}
    </div>
  );
}
