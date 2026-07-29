import GenericCrudPage from './GenericCrudPage';
import { StatusBadge } from '../components/shared';
import { resolvePhotoSrc } from '../components/PhotoField';

export const CategoriesAdminPage = () => (
  <GenericCrudPage resource="categories" title="Categories"
    fields={[
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon Name' },
      { key: 'order', label: 'Sort Order', type: 'number' },
    ]}
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description', render: i => <span className="line-clamp-1 max-w-xs">{String(i.description || '')}</span> },
      { key: 'order', label: 'Order' },
    ]}
  />
);

export const BrandsAdminPage = () => (
  <GenericCrudPage resource="brands" title="Brands"
    fields={[
      { key: 'name', label: 'Brand Name', required: true },
      { key: 'country', label: 'Country' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'website', label: 'Website URL' },
    ]}
    columns={[
      { key: 'name', label: 'Brand' },
      { key: 'country', label: 'Country' },
      { key: 'website', label: 'Website' },
    ]}
  />
);

export const DownloadsAdminPage = () => (
  <GenericCrudPage resource="downloads" title="Downloads"
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['catalogue', 'brochure', 'manual', 'datasheet', 'pdf'] },
      { key: 'url', label: 'File URL', required: true },
      { key: 'category', label: 'Category' },
    ]}
    columns={[{ key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'url', label: 'URL' }]}
  />
);

export const TeamAdminPage = () => (
  <GenericCrudPage resource="team" title="Team Members"
    fields={[
      { key: 'photo', label: 'Photo', type: 'image' },
      { key: 'name', label: 'Name', required: true },
      { key: 'position', label: 'Position', required: true },
      { key: 'department', label: 'Department' },
      { key: 'experience', label: 'Experience' },
      { key: 'email', label: 'Email' },
      { key: 'linkedin', label: 'LinkedIn URL' },
      { key: 'biography', label: 'Biography', type: 'textarea' },
      { key: 'order', label: 'Display Order', type: 'number' },
    ]}
    columns={[
      {
        key: 'photo',
        label: 'Photo',
        render: i => i.photo
          ? <img src={resolvePhotoSrc(String(i.photo))} alt="" className="w-10 h-10 rounded-full object-cover border border-steel/20" />
          : <span className="text-charcoal/40">—</span>,
      },
      { key: 'name', label: 'Name' },
      { key: 'position', label: 'Position' },
      { key: 'email', label: 'Email' },
    ]}
  />
);

export const ProjectsAdminPage = () => (
  <GenericCrudPage resource="projects" title="Projects"
    fields={[
      {
        key: 'image',
        label: 'Project Image',
        type: 'image',
        storeAs: 'images',
        storeAsArray: true,
        uploadFolder: 'projects',
        placeholderIcon: 'image',
      },
      { key: 'title', label: 'Project Title', required: true },
      { key: 'clientName', label: 'Client Name' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'industry', label: 'Industry' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'ongoing', 'planned', 'pending'] },
    ]}
    columns={[
      {
        key: 'images',
        label: 'Image',
        render: i => {
          const images = i.images as string[] | undefined;
          const src = images?.[0] ? resolvePhotoSrc(String(images[0])) : '';
          return src
            ? <img src={src} alt="" className="w-12 h-12 rounded-lg object-cover border border-steel/20" />
            : <span className="text-charcoal/40">—</span>;
        },
      },
      { key: 'title', label: 'Project' },
      { key: 'industry', label: 'Industry' },
      { key: 'status', label: 'Status', render: i => <StatusBadge status={i.status as string} /> },
    ]}
  />
);

export const GalleryAdminPage = () => (
  <GenericCrudPage resource="gallery" title="Gallery"
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'url', label: 'Image URL', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['office', 'warehouse', 'store', 'projects', 'products'] },
      { key: 'type', label: 'Type', type: 'select', options: ['image', 'video'] },
    ]}
    columns={[{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'type', label: 'Type' }]}
  />
);

export const TestimonialsAdminPage = () => (
  <GenericCrudPage resource="testimonials" title="Testimonials"
    fields={[
      { key: 'name', label: 'Customer Name', required: true },
      { key: 'company', label: 'Company' },
      { key: 'content', label: 'Review', type: 'textarea', required: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    ]}
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'company', label: 'Company' },
      { key: 'rating', label: 'Rating', render: i => '⭐'.repeat(Number(i.rating) || 5) },
    ]}
  />
);

export const FaqsAdminPage = () => (
  <GenericCrudPage resource="faqs" title="FAQs"
    fields={[
      { key: 'question', label: 'Question', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      { key: 'category', label: 'Category' },
      { key: 'order', label: 'Sort Order', type: 'number' },
    ]}
    columns={[
      { key: 'question', label: 'Question' },
      { key: 'category', label: 'Category' },
      { key: 'order', label: 'Order' },
    ]}
  />
);
