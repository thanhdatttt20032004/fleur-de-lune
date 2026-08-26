import React, { useState, useEffect } from 'react';
import { db, completeBouquet, formatPrice } from '../services/db';
import type { Bouquet, ShopSettings } from '../types';
import { 
  Plus, Edit2, Trash2, Save, Eye, EyeOff, LogOut, 
  Settings, Flower, Image as ImageIcon, Check, X, ArrowLeft,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data States
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [editingProduct, setEditingProduct] = useState<Bouquet | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    category: '',
    description: '',
    flowerTypes: '',
    occasion: '',
    hoverMessage: '',
    isActive: true,
    image: '',
  });

  const [settingsForm, setSettingsForm] = useState<ShopSettings>({
    shopName: '',
    logo: '',
    phone: '',
    zaloLink: '',
    messengerLink: '',
    instagramLink: '',
    address: '',
    openingHours: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
  });

  // Check login session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('fleur_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    const list = db.getProducts();
    setProducts(list);
    const shopSettings = db.getSettings();
    setSettings(shopSettings);
    setSettingsForm(shopSettings);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fleur_admin_auth', 'true');
      loadData();
      setLoginError('');
    } else {
      setLoginError('Mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('fleur_admin_auth');
    setPassword('');
  };

  // Image upload to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isHero = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit base64 size, recommended under 1.5MB for localStorage)
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Hãy chọn ảnh dưới 1.5MB để tối ưu hóa bộ nhớ.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isHero) {
        setSettingsForm(prev => ({ ...prev, heroImage: base64String }));
      } else {
        setProductForm(prev => ({ ...prev, image: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick toggle active status
  const handleToggleActive = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    setProducts(updated);
    db.saveProducts(updated);
  };

  // Open edit product form
  const handleOpenEdit = (product: Bouquet) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      flowerTypes: product.flowerTypes.join(', '),
      occasion: product.occasion.join(', '),
      hoverMessage: product.hoverMessage,
      isActive: product.isActive,
      image: product.image,
    });
    setIsAddingProduct(false);
  };

  // Open add product form
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: 350000,
      category: 'Best seller',
      description: '',
      flowerTypes: '',
      occasion: '',
      hoverMessage: '',
      isActive: true,
      image: '',
    });
    setIsAddingProduct(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.image) {
      alert('Vui lòng điền đầy đủ Tên, Giá và tải lên Hình ảnh hoa.');
      return;
    }

    const flowerTypesArr = productForm.flowerTypes
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
      
    const occasionsArr = productForm.occasion
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    let updatedProducts: Bouquet[] = [];

    if (isAddingProduct) {
      const newId = productForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

      const newProductData = {
        id: newId,
        name: productForm.name,
        price: Number(productForm.price),
        category: productForm.category || 'Best seller',
        description: productForm.description,
        flowerTypes: flowerTypesArr,
        occasion: occasionsArr,
        hoverMessage: productForm.hoverMessage || 'Bó hoa tươi xinh xắn.',
        isActive: productForm.isActive,
        image: productForm.image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // completeBouquet will generate visual attributes
      const fullProduct = completeBouquet(newProductData as any, products.length);
      updatedProducts = [...products, fullProduct];
    } else if (editingProduct) {
      updatedProducts = products.map(p => {
        if (p.id === editingProduct.id) {
          const updatedData = {
            ...p,
            name: productForm.name,
            price: Number(productForm.price),
            category: productForm.category,
            description: productForm.description,
            flowerTypes: flowerTypesArr,
            occasion: occasionsArr,
            hoverMessage: productForm.hoverMessage,
            isActive: productForm.isActive,
            image: productForm.image,
            updatedAt: new Date().toISOString(),
          };
          return completeBouquet(updatedData, products.indexOf(p));
        }
        return p;
      });
    }

    setProducts(updatedProducts);
    db.saveProducts(updatedProducts);
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = () => {
    if (!deleteConfirmId) return;
    const updated = products.filter(p => p.id !== deleteConfirmId);
    setProducts(updated);
    db.saveProducts(updated);
    setDeleteConfirmId(null);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      db.saveSettings(settingsForm);
      setSettings(settingsForm);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center px-4"
        style={{ background: 'linear-gradient(180deg, #fffaf6 0%, #fbf4ef 100%)' }}
      >
        <div className="w-full max-w-md rounded-xl border border-[#eadfd3] bg-white p-8 shadow-[0_20px_50px_rgba(54,42,45,0.06)]">
          <div className="mb-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf0f2] text-[#b7797a] mb-3">
              <Flower size={24} />
            </span>
            <h2 className="text-2xl font-bold text-[#302935]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Fleur de Lune
            </h2>
            <p className="mt-1 text-sm text-[#7a6b67]">Trang quản trị cửa hàng hoa</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">
                Mật khẩu quản trị
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (mặc định: admin123)"
                className="w-full rounded-md border border-[#ded2c1] px-4 py-3 text-sm text-[#302935] placeholder-[#c3b6a5] focus:border-[#b7797a] focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-red-500">{loginError}</p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#302935] py-3 text-sm font-bold text-white transition-all hover:bg-[#4a3f50]"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 border-t border-[#eadfd3] pt-4 text-center">
            <a href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7a8b60] hover:underline">
              <ArrowLeft size={14} /> Quay về trang chủ cửa hàng
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f0] text-[#302935]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e8decf] bg-[#fffaf6]/95 py-4 px-6 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-[#ded2c1] bg-white text-[#7a8b60]">
              <Flower size={18} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[#302935]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {settings?.shopName || 'Fleur de Lune'} Admin
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-[#7a6b67] font-semibold">Trang quản trị cửa hàng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="inline-flex items-center gap-1.5 rounded-md border border-[#eadfd3] bg-white px-3 py-1.5 text-xs font-bold text-[#4a3745] hover:bg-[#fcfaf7]"
            >
              Xem Cửa hàng <ExternalLink size={13} />
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#b7797a] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c98c8d]"
            >
              Đăng xuất <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex border-b border-[#e8decf]">
          <button
            onClick={() => { setActiveTab('products'); setIsAddingProduct(false); setEditingProduct(null); }}
            className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all ${
              activeTab === 'products'
                ? 'border-[#302935] text-[#302935]'
                : 'border-transparent text-[#7a6b67] hover:text-[#302935]'
            }`}
          >
            <Flower size={16} /> Quản lý bó hoa ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all ${
              activeTab === 'settings'
                ? 'border-[#302935] text-[#302935]'
                : 'border-transparent text-[#7a6b67] hover:text-[#302935]'
            }`}
          >
            <Settings size={16} /> Cấu hình cửa hàng
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'products' ? (
          <div>
            {!isAddingProduct && !editingProduct ? (
              /* PRODUCT LIST VIEW */
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#302935]">Danh sách Bó Hoa</h2>
                    <p className="text-xs text-[#7a6b67]">Quản lý sản phẩm hiển thị trên website chính</p>
                  </div>
                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 rounded-md bg-[#7a8b60] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#687851]"
                  >
                    <Plus size={15} /> Thêm bó hoa mới
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#eadfd3] bg-white p-12 text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f0ec] text-[#a39485] mb-3">
                      <Flower size={24} />
                    </span>
                    <p className="font-semibold text-[#302935]">Không có bó hoa nào!</p>
                    <p className="mt-1 text-xs text-[#7a6b67] mb-4">Hãy thêm bó hoa đầu tiên của shop.</p>
                    <button
                      onClick={handleOpenAdd}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#302935] px-4 py-2 text-xs font-bold text-white"
                    >
                      <Plus size={14} /> Thêm ngay
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[#eadfd3] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm text-[#4a3745]">
                        <thead className="bg-[#fcfaf8] text-xs font-bold uppercase tracking-wider text-[#7a6b67] border-b border-[#eadfd3]">
                          <tr>
                            <th className="px-6 py-4">Bó hoa</th>
                            <th className="px-6 py-4">Phân loại</th>
                            <th className="px-6 py-4 text-right">Giá bán</th>
                            <th className="px-6 py-4">Loại hoa / Dịp tặng</th>
                            <th className="px-6 py-4 text-center">Hiển thị</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eadfd3]">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-[#fcfbf9]/60">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="h-12 w-12 rounded object-cover border border-[#eadfd3]" 
                                  />
                                  <div>
                                    <p className="font-bold text-[#302935]">{product.name}</p>
                                    <p className="text-[10px] text-[#7a6b67] italic max-w-xs truncate">{product.hoverMessage}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-block rounded bg-[#f7eedc] px-2 py-0.5 text-xs font-bold text-[#b88c3a]">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-extrabold text-[#302935]">
                                {formatPrice(product.price)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="max-w-[240px] space-y-1">
                                  <p className="text-xs truncate text-[#7a8b60] font-medium">
                                    🌸 {product.flowerTypes.join(', ')}
                                  </p>
                                  <p className="text-xs truncate text-[#b7797a] font-medium">
                                    🎁 {product.occasion.join(', ')}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleToggleActive(product.id)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                    product.isActive
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {product.isActive ? (
                                    <>
                                      <Eye size={12} /> Hiện
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff size={12} /> Ẩn
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenEdit(product)}
                                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Sửa"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(product.id)}
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    title="Xóa"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ADD/EDIT FORM VIEW */
              <div className="mx-auto max-w-3xl rounded-xl border border-[#eadfd3] bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b border-[#e8decf] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#302935]">
                      {isAddingProduct ? 'Thêm Bó Hoa Mới' : 'Chỉnh Sửa Bó Hoa'}
                    </h2>
                    <p className="text-xs text-[#7a6b67]">Thiết lập chi tiết sản phẩm hoa của cửa hàng</p>
                  </div>
                  <button
                    onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                    className="p-1 text-[#7a6b67] hover:text-[#302935]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Tên bó hoa *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ví dụ: Rosy Blush"
                        className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Giá bán (₫) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={productForm.price || ''}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="Ví dụ: 450000"
                        className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Phân loại / Tag chính *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none bg-white"
                      >
                        <option value="Best seller">Best seller</option>
                        <option value="Premium bouquet">Premium bouquet</option>
                        <option value="Korean style">Korean style</option>
                        <option value="Daily flowers">Daily flowers</option>
                        <option value="Photo bouquet">Photo bouquet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Trạng thái hiển thị</label>
                      <div className="flex items-center h-10">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={productForm.isActive} 
                            onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a8b60]"></div>
                          <span className="ml-3 text-sm font-semibold text-[#4a3745]">Hiển thị sản phẩm</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Mô tả sản phẩm</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Nhập mô tả về bó hoa, ý nghĩa và cảm nhận..."
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Các loại hoa (Cách nhau bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={productForm.flowerTypes}
                        onChange={(e) => setProductForm(prev => ({ ...prev, flowerTypes: e.target.value }))}
                        placeholder="Hồng kem, Mẫu đơn, Lá eucalytus..."
                        className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Dịp phù hợp (Cách nhau bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={productForm.occasion}
                        onChange={(e) => setProductForm(prev => ({ ...prev, occasion: e.target.value }))}
                        placeholder="Sinh nhật, Kỷ niệm, Ngày của Mẹ..."
                        className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Câu nói thả thính khi hover ( Butterfly Message)</label>
                    <input
                      type="text"
                      value={productForm.hoverMessage}
                      onChange={(e) => setProductForm(prev => ({ ...prev, hoverMessage: e.target.value }))}
                      placeholder="Ví dụ: Tone màu ngọt ngào này chắc chắn sẽ làm cô ấy mỉm cười 🌸"
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Hình ảnh hoa *</label>
                    <div className="mt-1 flex items-center gap-5">
                      <div className="relative grid h-32 w-32 place-items-center rounded-lg border border-[#eadfd3] bg-[#faf6f2] overflow-hidden">
                        {productForm.image ? (
                          <img src={productForm.image} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center text-[#7a6b67]/60">
                            <ImageIcon size={24} className="mx-auto mb-1" />
                            <span className="text-[10px] font-semibold">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#eadfd3] bg-white px-3.5 py-2 text-xs font-bold text-[#4a3745] hover:bg-[#faf8f5]">
                          <ImageIcon size={14} /> Tải ảnh mới lên
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-[#7a6b67]">Chấp nhận định dạng ảnh phổ biến. Giới hạn dung lượng ảnh &lt; 1.5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-[#e8decf] pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                      className="rounded-md border border-[#eadfd3] bg-white px-4 py-2.5 text-xs font-bold text-[#4a3745] hover:bg-[#faf8f5]"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#302935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#4a3f50]"
                    >
                      <Check size={14} /> Lưu bó hoa
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* SHOP SETTINGS VIEW */
          <div className="mx-auto max-w-3xl rounded-xl border border-[#eadfd3] bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-[#e8decf] pb-4">
              <h2 className="text-xl font-bold text-[#302935]">Cấu hình Cửa Hàng</h2>
              <p className="text-xs text-[#7a6b67]">Chỉnh sửa thông tin liên hệ, mạng xã hội, tiêu đề banner hero</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#b7797a] border-b border-[#f3ebdf] pb-2">Thông tin cơ bản</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Tên shop hoa</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.shopName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, shopName: e.target.value }))}
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Số điện thoại hotline</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Địa chỉ cửa hàng</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Giờ mở cửa</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, openingHours: e.target.value }))}
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Chat Links */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#b7797a] border-b border-[#f3ebdf] pb-2">Liên kết đặt hoa qua Chat</h3>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Đường dẫn Zalo</label>
                    <input
                      type="url"
                      value={settingsForm.zaloLink}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, zaloLink: e.target.value }))}
                      placeholder="https://zalo.me/..."
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Đường dẫn Messenger</label>
                    <input
                      type="url"
                      value={settingsForm.messengerLink}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, messengerLink: e.target.value }))}
                      placeholder="https://m.me/..."
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Đường dẫn Instagram</label>
                    <input
                      type="url"
                      value={settingsForm.instagramLink}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, instagramLink: e.target.value }))}
                      placeholder="https://instagram.com/..."
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Settings */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#b7797a] border-b border-[#f3ebdf] pb-2">Banner / Hero chính</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Tiêu đề lớn Hero</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.heroTitle}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Tiêu đề phụ / Mô tả Hero</label>
                    <textarea
                      rows={2}
                      required
                      value={settingsForm.heroSubtitle}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="w-full rounded-md border border-[#ded2c1] px-3.5 py-2 text-sm text-[#302935] focus:border-[#b7797a] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4a3745] mb-2">Ảnh nền / Ảnh nổi bật Hero</label>
                  <div className="mt-1 flex items-center gap-5">
                    <div className="relative grid h-32 w-48 place-items-center rounded-lg border border-[#eadfd3] bg-[#faf6f2] overflow-hidden">
                      {settingsForm.heroImage ? (
                        <img src={settingsForm.heroImage} alt="Hero Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center text-[#7a6b67]/60">
                          <ImageIcon size={24} className="mx-auto mb-1" />
                          <span className="text-[10px] font-semibold">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#eadfd3] bg-white px-3.5 py-2 text-xs font-bold text-[#4a3745] hover:bg-[#faf8f5]">
                        <ImageIcon size={14} /> Thay ảnh banner
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-[#7a6b67]">Ảnh sẽ hiển thị trên trang chủ của shop.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form submit footer */}
              <div className="flex items-center justify-between border-t border-[#e8decf] pt-4">
                <div>
                  {saveStatus === 'saving' && <span className="text-xs text-blue-500 font-semibold">Đang lưu thay đổi...</span>}
                  {saveStatus === 'success' && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check size={14} /> Lưu thành công!</span>}
                  {saveStatus === 'error' && <span className="text-xs text-red-500 font-bold">Lỗi khi lưu cấu hình!</span>}
                </div>

                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#302935] px-5 py-3 text-xs font-bold text-white hover:bg-[#4a3f50] disabled:opacity-50"
                >
                  <Save size={14} /> Lưu cấu hình shop
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4a2437]/15 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[#eadfd3] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#302935]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Xóa bó hoa?
            </h3>
            <p className="mt-2 text-xs leading-5 text-[#7a6b67]">
              Bạn có chắc chắn muốn xóa bó hoa này ra khỏi danh sách cửa hàng? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-md border border-[#eadfd3] bg-white px-3.5 py-2 text-xs font-bold text-[#4a3745] hover:bg-[#faf8f5]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteProduct}
                className="rounded-md bg-red-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-600"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
