'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createProduct } from '@/lib/api/catalog';
import { useRequireAdmin } from '@/lib/hooks/useAuth';
import { CategoryEnum } from '@/lib/types/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'Men', label: 'Men' },
  { value: 'Kids', label: 'Kids' },
  { value: 'Shoes', label: 'Shoes' },
  { value: 'Accessories', label: 'Accessories' },
];

export default function AddProductPage() {
  const router = useRouter();
  const { authorized, loading: authLoading } = useRequireAdmin();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<CategoryEnum>('Men' as CategoryEnum);
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inStock, setInStock] = useState(true);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Show loading state while checking authorization
  if (authLoading) {
    return (
      <div className="container-page py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black"></div>
          <p className="mt-4 text-brand-gray">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized (hook will redirect)
  if (!authorized) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes((prev) => [...prev, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setSizes((prev) => prev.filter((s) => s !== size));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!name || !description || !barcode || !price || !quantity) {
        throw new Error('Please fill in all required fields');
      }

      if (images.length === 0) {
        throw new Error('Please upload at least one image');
      }

      // Prepare data matching backend contract (snake_case)
      const productData = {
        name,
        description,
        barcode,
        category,
        subcategory: subcategory || undefined,
        brand: brand || undefined,
        price: price,
        discounted_price: discountedPrice || undefined,
        quantity: parseInt(quantity),
        in_stock: inStock,
        sizes: sizes.length > 0 ? JSON.stringify(sizes) : undefined,
        images,
      };

      const result = await createProduct(productData);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/products/${result.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">Add Product</h1>
        <p className="text-brand-gray mb-8">Create a new product listing</p>

        {error && (
          <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red text-accent-red text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-500 text-green-700 text-sm">
            Product created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-medium">Basic Information</h2>

            <Input
              label="Product Name *"
              placeholder="e.g., Classic Cotton T-Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="label">Description *</label>
              <textarea
                className="input min-h-[120px]"
                placeholder="Describe the product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Barcode / SKU *"
                placeholder="e.g., LEG001234"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                required
              />

              <Select
                label="Category *"
                options={CATEGORIES}
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryEnum)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Subcategory"
                placeholder="e.g., T-Shirts"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />

              <Input
                label="Brand"
                placeholder="e.g., LEGO"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-medium">Pricing & Inventory</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                placeholder="99.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <Input
                label="Discounted Price"
                type="number"
                step="0.01"
                placeholder="79.99"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Quantity *"
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <div>
                <label className="label">Stock Status</label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={inStock}
                      onChange={() => setInStock(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-body">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!inStock}
                      onChange={() => setInStock(false)}
                      className="w-4 h-4"
                    />
                    <span className="text-body">Out of Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-medium">Sizes (Optional)</h2>

            <div className="flex gap-2">
              <Input
                placeholder="e.g., S, M, L, XL"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <Button type="button" variant="outline" onClick={addSize}>
                Add
              </Button>
            </div>

            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center gap-2 px-3 py-1 bg-brand-lightgray rounded"
                  >
                    <span className="text-body">{size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-brand-gray hover:text-accent-red"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-medium">Product Images *</h2>
            <p className="text-caption text-brand-gray">Upload multiple images (JPEG, PNG)</p>

            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="btn-outline cursor-pointer inline-block">
                Choose Images
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                    title='remove image'
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Create Product
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/products')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
