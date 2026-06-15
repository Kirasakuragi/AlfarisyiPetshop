const { useState, useMemo, useEffect } = React;

// ---------- ICONS (simple inline emoji-free SVG via unicode glyphs for portability) ----------
const Icon = ({ name }) => {
  const icons = {
    dashboard: "▦",
    box: "📦",
    cart: "🛒",
    purchase: "📥",
    sales: "📤",
    debt: "⏳",
    customer: "🐾",
    report: "📊",
    settings: "⚙",
    plus: "+",
    edit: "✎",
    trash: "🗑",
    search: "🔍",
    money: "₨",
    alert: "!",
    check: "✓",
    dog: "🐶",
    cat: "🐱",
    bell: "🔔",
    paw: "🐾"
  };
  return <span>{icons[name] || ""}</span>;
};

// ---------- SEED DATA ----------
const initialProducts = [
  { id: "P001", name: "Royal Canin Adult Dog 1.5kg", category: "Makanan Anjing", unit: "pcs", stock: 18, minStock: 5, buyPrice: 145000, sellPrice: 185000, supplier: "PT Indo Pet Distribusi" },
  { id: "P002", name: "Whiskas Pouch Tuna 85g", category: "Makanan Kucing", unit: "pcs", stock: 4, minStock: 10, buyPrice: 7500, sellPrice: 11000, supplier: "CV Sumber Hewan" },
  { id: "P003", name: "Pasir Kucing Gumpal 10L", category: "Perlengkapan", unit: "pcs", stock: 22, minStock: 8, buyPrice: 38000, sellPrice: 55000, supplier: "CV Sumber Hewan" },
  { id: "P004", name: "Shampo Anjing Anti Kutu 250ml", category: "Grooming", unit: "botol", stock: 9, minStock: 5, buyPrice: 28000, sellPrice: 42000, supplier: "PT Indo Pet Distribusi" },
  { id: "P005", name: "Kandang Kucing Lipat M", category: "Aksesoris", unit: "pcs", stock: 3, minStock: 2, buyPrice: 210000, sellPrice: 285000, supplier: "UD Mitra Satwa" },
  { id: "P006", name: "Vitamin Bulu Kucing & Anjing", category: "Obat & Vitamin", unit: "botol", stock: 2, minStock: 6, buyPrice: 32000, sellPrice: 48000, supplier: "PT Indo Pet Distribusi" },
  { id: "P007", name: "Mainan Gigit Anjing Karet", category: "Aksesoris", unit: "pcs", stock: 14, minStock: 5, buyPrice: 12000, sellPrice: 22000, supplier: "UD Mitra Satwa" },
  { id: "P008", name: "Pro Plan Kitten 1kg", category: "Makanan Kucing", unit: "pcs", stock: 11, minStock: 5, buyPrice: 98000, sellPrice: 128000, supplier: "CV Sumber Hewan" },
];

const initialCustomers = [
  { id: "C001", name: "Bu Sari", phone: "0812-3456-7890", type: "Member", pet: "Kucing - Mochi", totalBelanja: 540000 },
  { id: "C002", name: "Pak Andi", phone: "0813-2222-9988", type: "Reguler", pet: "Anjing - Bruno", totalBelanja: 215000 },
  { id: "C003", name: "Toko Sahabat Satwa", phone: "0811-7777-1212", type: "Reseller", pet: "-", totalBelanja: 3200000 },
];

const initialSales = [
  { id: "TRX-0001", date: "2026-06-10", customer: "Bu Sari", items: [{ id: "P001", name: "Royal Canin Adult Dog 1.5kg", qty: 1, price: 185000 }], total: 185000, payment: "Tunai" },
  { id: "TRX-0002", date: "2026-06-12", customer: "Umum", items: [{ id: "P002", name: "Whiskas Pouch Tuna 85g", qty: 5, price: 11000 }, { id: "P003", name: "Pasir Kucing Gumpal 10L", qty: 1, price: 55000 }], total: 110000, payment: "QRIS" },
];

const initialPurchases = [
  { id: "PB-0001", date: "2026-06-05", supplier: "PT Indo Pet Distribusi", items: [{ id: "P001", name: "Royal Canin Adult Dog 1.5kg", qty: 10, price: 145000 }], total: 1450000, status: "Lunas", dueDate: "" },
  { id: "PB-0002", date: "2026-06-08", supplier: "CV Sumber Hewan", items: [{ id: "P002", name: "Whiskas Pouch Tuna 85g", qty: 50, price: 7500 }, { id: "P008", name: "Pro Plan Kitten 1kg", qty: 15, price: 98000 }], total: 1845000, status: "Belum Lunas", dueDate: "2026-06-25" },
];

const initialDebts = [
  { id: "HT-0001", supplier: "CV Sumber Hewan", refPurchase: "PB-0002", amount: 1845000, dueDate: "2026-06-25", status: "Belum Lunas", note: "Tempo 17 hari, faktur Pro Plan & Whiskas" },
  { id: "HT-0002", supplier: "UD Mitra Satwa", refPurchase: "-", amount: 495000, dueDate: "2026-06-20", status: "Belum Lunas", note: "Kandang & mainan gigit batch Mei" },
  { id: "HT-0003", supplier: "PT Indo Pet Distribusi", refPurchase: "PB-0001", amount: 1450000, dueDate: "2026-06-10", status: "Lunas", note: "Sudah dibayar transfer 9 Juni" },
];

const formatRp = (num) => "Rp " + Number(num || 0).toLocaleString("id-ID");
const today = () => new Date().toISOString().slice(0, 10);
const daysUntil = (dateStr) => {
  const diff = (new Date(dateStr) - new Date(today())) / (1000*60*60*24);
  return Math.round(diff);
};

// ---------- APP ----------
function App() {
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [sales, setSales] = useState(initialSales);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [debts, setDebts] = useState(initialDebts);

  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const dueSoonDebts = debts.filter(d => d.status === "Belum Lunas" && daysUntil(d.dueDate) <= 3);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "pos", label: "Kasir (Penjualan)", icon: "cart" },
    { key: "products", label: "Produk & Stok", icon: "box" },
    { key: "purchases", label: "Pembelian", icon: "purchase" },
    { key: "debts", label: "Hutang Tempo", icon: "debt" },
    { key: "sales", label: "Riwayat Penjualan", icon: "sales" },
    { key: "customers", label: "Pelanggan", icon: "customer" },
    { key: "reports", label: "Laporan", icon: "report" },
  ];

  const ctx = { products, setProducts, customers, setCustomers, sales, setSales, purchases, setPurchases, debts, setDebts, lowStockItems, dueSoonDebts, setPage };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Icon name="paw" /></div>
          <div className="brand-text">
            <h1>Alfarisyi</h1>
            <span>PETSHOP MANAGER</span>
          </div>
        </div>
        <div className="nav-section-label">Menu Utama</div>
        {navItems.slice(0,1).map(item => (
          <button key={item.key} className={"nav-item" + (page===item.key?" active":"")} onClick={()=>setPage(item.key)}>
            <span className="nav-icon"><Icon name={item.icon} /></span>{item.label}
          </button>
        ))}
        <div className="nav-section-label">Transaksi</div>
        {navItems.slice(1,4).map(item => (
          <button key={item.key} className={"nav-item" + (page===item.key?" active":"")} onClick={()=>setPage(item.key)}>
            <span className="nav-icon"><Icon name={item.icon} /></span>{item.label}
          </button>
        ))}
        <div className="nav-section-label">Keuangan & Data</div>
        {navItems.slice(4).map(item => (
          <button key={item.key} className={"nav-item" + (page===item.key?" active":"")} onClick={()=>setPage(item.key)}>
            <span className="nav-icon"><Icon name={item.icon} /></span>{item.label}
            {item.key==="debts" && dueSoonDebts.length>0 && <span className="badge badge-danger" style={{marginLeft:"auto"}}>{dueSoonDebts.length}</span>}
            {item.key==="products" && lowStockItems.length>0 && <span className="badge badge-warn" style={{marginLeft:"auto"}}>{lowStockItems.length}</span>}
          </button>
        ))}
      </aside>
      <main className="main">
        {page === "dashboard" && <Dashboard ctx={ctx} />}
        {page === "pos" && <POS ctx={ctx} />}
        {page === "products" && <Products ctx={ctx} />}
        {page === "purchases" && <Purchases ctx={ctx} />}
        {page === "debts" && <Debts ctx={ctx} />}
        {page === "sales" && <SalesHistory ctx={ctx} />}
        {page === "customers" && <Customers ctx={ctx} />}
        {page === "reports" && <Reports ctx={ctx} />}
      </main>
    </div>
  );
}

// ---------- DASHBOARD ----------
function Dashboard({ ctx }) {
  const { products, sales, debts, lowStockItems, dueSoonDebts, setPage } = ctx;
  const totalOmzetHariIni = sales.filter(s=>s.date===today()).reduce((a,s)=>a+s.total,0);
  const totalOmzetBulan = sales.reduce((a,s)=>a+s.total,0);
  const totalHutang = debts.filter(d=>d.status==="Belum Lunas").reduce((a,d)=>a+d.amount,0);
  const totalStockValue = products.reduce((a,p)=>a+p.stock*p.buyPrice,0);

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Selamat datang kembali 👋</h2>
          <p>Ringkasan operasional Alfarisyi Petshop — {new Date().toLocaleDateString("id-ID",{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
        </div>
        <span className="pill-badge"><Icon name="paw" /> More than a pet shop</span>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="icon-circle bg-sage"><Icon name="sales" /></div>
          <div className="label">Penjualan Hari Ini</div>
          <div className="value">{formatRp(totalOmzetHariIni)}</div>
          <div className="sub">{sales.filter(s=>s.date===today()).length} transaksi</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-tan"><Icon name="money" /></div>
          <div className="label">Total Omzet Tercatat</div>
          <div className="value">{formatRp(totalOmzetBulan)}</div>
          <div className="sub">{sales.length} transaksi total</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-warn"><Icon name="debt" /></div>
          <div className="label">Hutang Belum Lunas</div>
          <div className="value">{formatRp(totalHutang)}</div>
          <div className="sub">{debts.filter(d=>d.status==="Belum Lunas").length} faktur supplier</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-danger"><Icon name="box" /></div>
          <div className="label">Nilai Stok Gudang</div>
          <div className="value">{formatRp(totalStockValue)}</div>
          <div className="sub">{products.length} jenis produk</div>
        </div>
      </div>

      <div className="grid grid-2" style={{marginTop:"24px"}}>
        <div className="card">
          <div className="section-head" style={{marginTop:0}}>
            <h3>⚠ Stok Menipis</h3>
            <button className="btn btn-outline btn-sm" onClick={()=>setPage("products")}>Kelola Stok</button>
          </div>
          {lowStockItems.length===0 ? (
            <div className="empty"><div className="icon">✓</div>Semua stok aman</div>
          ) : (
            <table>
              <thead><tr><th>Produk</th><th>Stok</th><th>Min</th></tr></thead>
              <tbody>
                {lowStockItems.map(p=>(
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="badge badge-danger">{p.stock} {p.unit}</span></td>
                    <td>{p.minStock} {p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="section-head" style={{marginTop:0}}>
            <h3>⏳ Hutang Akan Jatuh Tempo</h3>
            <button className="btn btn-outline btn-sm" onClick={()=>setPage("debts")}>Lihat Semua</button>
          </div>
          {dueSoonDebts.length===0 ? (
            <div className="empty"><div className="icon">✓</div>Tidak ada tempo mendesak</div>
          ) : (
            <table>
              <thead><tr><th>Supplier</th><th>Jumlah</th><th>Jatuh Tempo</th></tr></thead>
              <tbody>
                {dueSoonDebts.map(d=>{
                  const days = daysUntil(d.dueDate);
                  return (
                    <tr key={d.id}>
                      <td>{d.supplier}</td>
                      <td>{formatRp(d.amount)}</td>
                      <td><span className={"badge " + (days<0?"badge-danger":days<=1?"badge-danger":"badge-warn")}>{days<0?`Telat ${Math.abs(days)} hari`:days===0?"Hari ini":`${days} hari`}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{marginTop:"24px"}}>
        <div className="section-head" style={{marginTop:0}}>
          <h3>Transaksi Penjualan Terbaru</h3>
          <button className="btn btn-outline btn-sm" onClick={()=>setPage("sales")}>Riwayat Lengkap</button>
        </div>
        <table>
          <thead><tr><th>No. Transaksi</th><th>Tanggal</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Pembayaran</th></tr></thead>
          <tbody>
            {sales.slice(-5).reverse().map(s=>(
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.date}</td>
                <td>{s.customer}</td>
                <td>{s.items.length} jenis</td>
                <td>{formatRp(s.total)}</td>
                <td><span className="badge badge-neutral">{s.payment}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- POS / KASIR ----------
function POS({ ctx }) {
  const { products, setProducts, sales, setSales, customers } = ctx;
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("Umum");
  const [payment, setPayment] = useState("Tunai");
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()) && p.stock > 0);

  const addToCart = (p) => {
    setCart(prev=>{
      const existing = prev.find(c=>c.id===p.id);
      if (existing) {
        if (existing.qty >= p.stock) return prev;
        return prev.map(c=>c.id===p.id?{...c, qty:c.qty+1}:c);
      }
      return [...prev, { id:p.id, name:p.name, price:p.sellPrice, qty:1, maxStock:p.stock }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev=>prev.map(c=>{
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      if (newQty <= 0) return null;
      if (newQty > c.maxStock) return c;
      return {...c, qty:newQty};
    }).filter(Boolean));
  };

  const total = cart.reduce((a,c)=>a+c.price*c.qty,0);

  const checkout = () => {
    if (cart.length===0) return;
    const newId = "TRX-" + String(sales.length+1).padStart(4,"0");
    const newSale = { id:newId, date: today(), customer, items: cart.map(c=>({id:c.id,name:c.name,qty:c.qty,price:c.price})), total, payment };
    setSales(prev=>[...prev, newSale]);
    setProducts(prev=>prev.map(p=>{
      const inCart = cart.find(c=>c.id===p.id);
      return inCart ? {...p, stock: p.stock - inCart.qty} : p;
    }));
    setCart([]);
    setCustomer("Umum");
    setShowSuccess(newId);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Kasir (Penjualan)</h2>
          <p>Pilih produk untuk membuat transaksi penjualan baru</p>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:"1.6fr 1fr", gap:"20px"}}>
        <div className="card">
          <div className="search-bar">
            <input placeholder="Cari produk (nama)..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Produk</th><th>Kategori</th><th>Stok</th><th>Harga</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="badge badge-neutral">{p.category}</span></td>
                    <td>{p.stock} {p.unit}</td>
                    <td>{formatRp(p.sellPrice)}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={()=>addToCart(p)}>+ Tambah</button></td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan="5"><div className="empty">Produk tidak ditemukan / stok habis</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{display:"flex", flexDirection:"column"}}>
          <h3 style={{marginBottom:"14px"}}>🛒 Keranjang</h3>
          <div className="field" style={{marginBottom:"10px"}}>
            <label>Pelanggan</label>
            <select value={customer} onChange={e=>setCustomer(e.target.value)}>
              <option value="Umum">Umum (Tanpa Member)</option>
              {customers.map(c=><option key={c.id} value={c.name}>{c.name} ({c.type})</option>)}
            </select>
          </div>

          <div style={{flex:1, minHeight:"120px"}}>
            {cart.length===0 ? (
              <div className="empty"><div className="icon">🛒</div>Keranjang kosong</div>
            ) : cart.map(c=>(
              <div className="cart-item" key={c.id}>
                <div>
                  <div style={{fontWeight:700, fontSize:"13.5px"}}>{c.name}</div>
                  <div style={{fontSize:"12px", color:"var(--ink-soft)"}}>{formatRp(c.price)} x {c.qty} = {formatRp(c.price*c.qty)}</div>
                </div>
                <div className="qty-control">
                  <button onClick={()=>updateQty(c.id,-1)}>−</button>
                  <span>{c.qty}</span>
                  <button onClick={()=>updateQty(c.id,1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="field" style={{marginTop:"10px"}}>
            <label>Metode Pembayaran</label>
            <select value={payment} onChange={e=>setPayment(e.target.value)}>
              <option>Tunai</option>
              <option>QRIS</option>
              <option>Transfer Bank</option>
              <option>Kasbon Reseller</option>
            </select>
          </div>

          <div style={{borderTop:"2px solid var(--cream)", marginTop:"12px", paddingTop:"12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontWeight:700, color:"var(--ink-soft)"}}>Total</span>
            <span style={{fontSize:"22px", fontWeight:700, fontFamily:"'Poppins',sans-serif"}}>{formatRp(total)}</span>
          </div>
          <button className="btn btn-primary" style={{width:"100%", marginTop:"14px", justifyContent:"center", padding:"12px"}} onClick={checkout} disabled={cart.length===0}>
            Selesaikan Transaksi
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="modal-overlay" onClick={()=>setShowSuccess(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{textAlign:"center"}}>
            <div style={{fontSize:"40px", marginBottom:"10px"}}>✅</div>
            <h3>Transaksi Berhasil!</h3>
            <p style={{color:"var(--ink-soft)", marginBottom:"10px"}}>Transaksi <b>{showSuccess}</b> telah disimpan dan stok otomatis diperbarui.</p>
            <button className="btn btn-primary" onClick={()=>setShowSuccess(false)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- PRODUCTS & STOCK ----------
function Products({ ctx }) {
  const { products, setProducts } = ctx;
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [modal, setModal] = useState(null); // {mode:'add'|'edit'|'adjust', data}
  const categories = ["Semua", ...new Set(products.map(p=>p.category))];

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter==="Semua" || p.category===categoryFilter)
  );

  const emptyForm = { id:"", name:"", category:"", unit:"pcs", stock:0, minStock:1, buyPrice:0, sellPrice:0, supplier:"" };

  const saveProduct = (data) => {
    if (modal.mode === "add") {
      const newId = "P" + String(products.length+1).padStart(3,"0");
      setProducts(prev=>[...prev, {...data, id:newId, stock:Number(data.stock), minStock:Number(data.minStock), buyPrice:Number(data.buyPrice), sellPrice:Number(data.sellPrice)}]);
    } else {
      setProducts(prev=>prev.map(p=>p.id===data.id ? {...data, stock:Number(data.stock), minStock:Number(data.minStock), buyPrice:Number(data.buyPrice), sellPrice:Number(data.sellPrice)} : p));
    }
    setModal(null);
  };

  const adjustStock = (id, type, qty, note) => {
    setProducts(prev=>prev.map(p=>{
      if (p.id !== id) return p;
      const delta = type === "Masuk" ? Number(qty) : -Number(qty);
      return {...p, stock: Math.max(0, p.stock + delta)};
    }));
    setModal(null);
  };

  const deleteProduct = (id) => {
    if (confirm("Hapus produk ini dari katalog?")) setProducts(prev=>prev.filter(p=>p.id!==id));
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Produk & Stok</h2>
          <p>Kelola katalog produk, harga, dan jumlah stok masuk/keluar</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal({mode:"add", data:{...emptyForm}})}><Icon name="plus" /> Tambah Produk</button>
      </div>

      <div className="search-bar">
        <input placeholder="Cari nama produk..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Kode</th><th>Nama Produk</th><th>Kategori</th><th>Stok</th><th>Harga Beli</th><th>Harga Jual</th><th>Supplier</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(p=>{
                const ratio = Math.min(100, Math.round((p.stock / Math.max(p.minStock*3,1))*100));
                const low = p.stock <= p.minStock;
                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td><span className="badge badge-neutral">{p.category}</span></td>
                    <td>
                      <span className={low?"badge badge-danger":"badge badge-ok"}>{p.stock} {p.unit}</span>
                      <span className="stock-bar"><div style={{width:ratio+"%", background: low?"var(--danger)":"var(--ok)"}}></div></span>
                    </td>
                    <td>{formatRp(p.buyPrice)}</td>
                    <td>{formatRp(p.sellPrice)}</td>
                    <td>{p.supplier}</td>
                    <td>
                      <div style={{display:"flex", gap:"6px"}}>
                        <button className="btn btn-outline btn-sm" onClick={()=>setModal({mode:"adjust", data:p})}>Stok ±</button>
                        <button className="btn btn-outline btn-icon" onClick={()=>setModal({mode:"edit", data:{...p}})}><Icon name="edit" /></button>
                        <button className="btn btn-danger btn-icon" onClick={()=>deleteProduct(p.id)}><Icon name="trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan="8"><div className="empty">Tidak ada produk ditemukan</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && modal.mode !== "adjust" && (
        <ProductFormModal modal={modal} setModal={setModal} onSave={saveProduct} />
      )}
      {modal && modal.mode === "adjust" && (
        <StockAdjustModal product={modal.data} onClose={()=>setModal(null)} onSave={adjustStock} />
      )}
    </div>
  );
}

function ProductFormModal({ modal, setModal, onSave }) {
  const [form, setForm] = useState(modal.data);
  const handle = (k,v) => setForm(prev=>({...prev, [k]:v}));
  return (
    <div className="modal-overlay" onClick={()=>setModal(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{modal.mode==="add" ? "Tambah Produk Baru" : "Edit Produk"}</h3>
        <div className="form-grid">
          <div className="field full" style={{gridColumn:"1 / -1"}}>
            <label>Nama Produk</label>
            <input value={form.name} onChange={e=>handle("name", e.target.value)} placeholder="Contoh: Royal Canin Adult 1.5kg" />
          </div>
          <div className="field">
            <label>Kategori</label>
            <input value={form.category} onChange={e=>handle("category", e.target.value)} placeholder="Makanan Anjing" />
          </div>
          <div className="field">
            <label>Satuan</label>
            <input value={form.unit} onChange={e=>handle("unit", e.target.value)} placeholder="pcs / botol / kg" />
          </div>
          <div className="field">
            <label>Stok Saat Ini</label>
            <input type="number" value={form.stock} onChange={e=>handle("stock", e.target.value)} />
          </div>
          <div className="field">
            <label>Stok Minimum</label>
            <input type="number" value={form.minStock} onChange={e=>handle("minStock", e.target.value)} />
          </div>
          <div className="field">
            <label>Harga Beli (Modal)</label>
            <input type="number" value={form.buyPrice} onChange={e=>handle("buyPrice", e.target.value)} />
          </div>
          <div className="field">
            <label>Harga Jual</label>
            <input type="number" value={form.sellPrice} onChange={e=>handle("sellPrice", e.target.value)} />
          </div>
          <div className="field" style={{gridColumn:"1 / -1"}}>
            <label>Supplier</label>
            <input value={form.supplier} onChange={e=>handle("supplier", e.target.value)} placeholder="Nama supplier" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={()=>setModal(null)}>Batal</button>
          <button className="btn btn-primary" onClick={()=>onSave(form)} disabled={!form.name || !form.category}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

function StockAdjustModal({ product, onClose, onSave }) {
  const [type, setType] = useState("Masuk");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Sesuaikan Stok: {product.name}</h3>
        <p style={{color:"var(--ink-soft)", fontSize:"13px", marginBottom:"14px"}}>Stok saat ini: <b>{product.stock} {product.unit}</b></p>
        <div className="form-grid">
          <div className="field">
            <label>Jenis</label>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="Masuk">Stok Masuk (+)</option>
              <option value="Keluar">Stok Keluar / Rusak (−)</option>
            </select>
          </div>
          <div className="field">
            <label>Jumlah</label>
            <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
          </div>
          <div className="field" style={{gridColumn:"1 / -1"}}>
            <label>Catatan (opsional)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Misal: barang rusak, stok opname, dll" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={()=>onSave(product.id, type, qty, note)}>Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}

// ---------- PURCHASES ----------
function Purchases({ ctx }) {
  const { products, setProducts, purchases, setPurchases, debts, setDebts } = ctx;
  const [modal, setModal] = useState(false);

  const savePurchase = (data) => {
    const newId = "PB-" + String(purchases.length+1).padStart(4,"0");
    const total = data.items.reduce((a,i)=>a+i.qty*i.price,0);
    const newPurchase = { id:newId, date: data.date, supplier: data.supplier, items: data.items, total, status: data.status, dueDate: data.dueDate };
    setPurchases(prev=>[...prev, newPurchase]);

    // update stock
    setProducts(prev=>prev.map(p=>{
      const item = data.items.find(i=>i.id===p.id);
      return item ? {...p, stock: p.stock + Number(item.qty)} : p;
    }));

    // if belum lunas, add to debts
    if (data.status === "Belum Lunas") {
      const newDebtId = "HT-" + String(debts.length+1).padStart(4,"0");
      setDebts(prev=>[...prev, { id:newDebtId, supplier:data.supplier, refPurchase:newId, amount: total, dueDate: data.dueDate, status:"Belum Lunas", note:"Otomatis dari pembelian " + newId }]);
    }
    setModal(false);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Pembelian (Stok Masuk dari Supplier)</h2>
          <p>Catat pembelian barang — stok otomatis bertambah, dan hutang tempo otomatis tercatat jika belum lunas</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Icon name="plus" /> Pembelian Baru</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>No. Faktur</th><th>Tanggal</th><th>Supplier</th><th>Item</th><th>Total</th><th>Status</th><th>Jatuh Tempo</th></tr></thead>
            <tbody>
              {purchases.slice().reverse().map(p=>(
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.date}</td>
                  <td>{p.supplier}</td>
                  <td>{p.items.map(i=>i.name+" x"+i.qty).join(", ")}</td>
                  <td>{formatRp(p.total)}</td>
                  <td><span className={"badge " + (p.status==="Lunas"?"badge-ok":"badge-warn")}>{p.status}</span></td>
                  <td>{p.dueDate || "-"}</td>
                </tr>
              ))}
              {purchases.length===0 && <tr><td colSpan="7"><div className="empty">Belum ada riwayat pembelian</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <PurchaseFormModal products={products} onClose={()=>setModal(false)} onSave={savePurchase} />}
    </div>
  );
}

function PurchaseFormModal({ products, onClose, onSave }) {
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState("Lunas");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ id:"", name:"", qty:1, price:0 }]);

  const updateItem = (idx, field, value) => {
    setItems(prev=>prev.map((it,i)=>{
      if (i!==idx) return it;
      if (field==="id") {
        const prod = products.find(p=>p.id===value);
        return { ...it, id:value, name: prod?prod.name:"", price: prod?prod.buyPrice:it.price };
      }
      return {...it, [field]:value};
    }));
  };
  const addItem = () => setItems(prev=>[...prev, { id:"", name:"", qty:1, price:0 }]);
  const removeItem = (idx) => setItems(prev=>prev.filter((_,i)=>i!==idx));

  const total = items.reduce((a,i)=>a+ (Number(i.qty)||0) * (Number(i.price)||0), 0);
  const validItems = items.filter(i=>i.id && Number(i.qty)>0);

  const handleSave = () => {
    onSave({
      supplier, date, status,
      dueDate: status==="Belum Lunas" ? dueDate : "",
      items: validItems.map(i=>({id:i.id, name:i.name, qty:Number(i.qty), price:Number(i.price)}))
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:"640px"}} onClick={e=>e.stopPropagation()}>
        <h3>Pembelian Baru</h3>
        <div className="form-grid">
          <div className="field">
            <label>Nama Supplier</label>
            <input value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="Nama supplier" />
          </div>
          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
        </div>

        <div style={{marginTop:"14px"}}>
          <label style={{fontSize:"12.5px", fontWeight:700, color:"var(--ink-soft)", display:"block", marginBottom:"8px"}}>Item Dibeli</label>
          {items.map((it, idx)=>(
            <div key={idx} style={{display:"grid", gridTemplateColumns:"2fr 0.8fr 1fr auto", gap:"8px", marginBottom:"8px", alignItems:"center"}}>
              <select value={it.id} onChange={e=>updateItem(idx,"id",e.target.value)}>
                <option value="">Pilih produk...</option>
                {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" placeholder="Qty" value={it.qty} onChange={e=>updateItem(idx,"qty",e.target.value)} />
              <input type="number" placeholder="Harga beli" value={it.price} onChange={e=>updateItem(idx,"price",e.target.value)} />
              <button className="btn btn-danger btn-icon" onClick={()=>removeItem(idx)}><Icon name="trash" /></button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={addItem}>+ Tambah Item</button>
        </div>

        <div className="form-grid" style={{marginTop:"14px"}}>
          <div className="field">
            <label>Status Pembayaran</label>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="Lunas">Lunas (Tunai/Transfer)</option>
              <option value="Belum Lunas">Belum Lunas (Hutang Tempo)</option>
            </select>
          </div>
          {status==="Belum Lunas" && (
            <div className="field">
              <label>Tanggal Jatuh Tempo</label>
              <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
            </div>
          )}
        </div>

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"16px", paddingTop:"12px", borderTop:"2px solid var(--cream)"}}>
          <span style={{fontWeight:700, color:"var(--ink-soft)"}}>Total Pembelian</span>
          <span style={{fontSize:"20px", fontWeight:700, fontFamily:"'Poppins',sans-serif"}}>{formatRp(total)}</span>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!supplier || validItems.length===0 || (status==="Belum Lunas" && !dueDate)}>Simpan Pembelian</button>
        </div>
      </div>
    </div>
  );
}

// ---------- DEBTS ----------
function Debts({ ctx }) {
  const { debts, setDebts } = ctx;
  const [filter, setFilter] = useState("Semua");
  const [modal, setModal] = useState(false);

  const filtered = debts.filter(d => filter==="Semua" || d.status===filter);
  const totalBelumLunas = debts.filter(d=>d.status==="Belum Lunas").reduce((a,d)=>a+d.amount,0);

  const markPaid = (id) => {
    setDebts(prev=>prev.map(d=>d.id===id ? {...d, status:"Lunas"} : d));
  };

  const addDebt = (data) => {
    const newId = "HT-" + String(debts.length+1).padStart(4,"0");
    setDebts(prev=>[...prev, {...data, id:newId, status:"Belum Lunas", refPurchase:"-"}]);
    setModal(false);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Hutang Tempo Barang</h2>
          <p>Pantau hutang ke supplier dan tanggal jatuh tempo pembayaran</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Icon name="plus" /> Catat Hutang Manual</button>
      </div>

      <div className="grid grid-3">
        <div className="card stat-card">
          <div className="icon-circle bg-danger"><Icon name="debt" /></div>
          <div className="label">Total Hutang Belum Lunas</div>
          <div className="value">{formatRp(totalBelumLunas)}</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-warn"><Icon name="alert" /></div>
          <div className="label">Akan Jatuh Tempo (≤3 hari)</div>
          <div className="value">{debts.filter(d=>d.status==="Belum Lunas" && daysUntil(d.dueDate)<=3).length} faktur</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-ok"><Icon name="check" /></div>
          <div className="label">Sudah Lunas</div>
          <div className="value">{debts.filter(d=>d.status==="Lunas").length} faktur</div>
        </div>
      </div>

      <div className="search-bar" style={{marginTop:"20px"}}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="Semua">Semua Status</option>
          <option value="Belum Lunas">Belum Lunas</option>
          <option value="Lunas">Lunas</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Supplier</th><th>Ref. Pembelian</th><th>Jumlah</th><th>Jatuh Tempo</th><th>Status</th><th>Catatan</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.slice().reverse().map(d=>{
                const days = daysUntil(d.dueDate);
                return (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.supplier}</td>
                    <td>{d.refPurchase}</td>
                    <td>{formatRp(d.amount)}</td>
                    <td>
                      {d.dueDate}
                      {d.status==="Belum Lunas" && (
                        <span className={"badge " + (days<0?"badge-danger":days<=3?"badge-warn":"badge-neutral")} style={{marginLeft:"8px"}}>
                          {days<0?`Telat ${Math.abs(days)}h`:days===0?"Hari ini":`${days} hari`}
                        </span>
                      )}
                    </td>
                    <td><span className={"badge " + (d.status==="Lunas"?"badge-ok":"badge-danger")}>{d.status}</span></td>
                    <td style={{maxWidth:"200px", whiteSpace:"normal"}}>{d.note}</td>
                    <td>
                      {d.status==="Belum Lunas" && <button className="btn btn-primary btn-sm" onClick={()=>markPaid(d.id)}>Tandai Lunas</button>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan="8"><div className="empty">Tidak ada data hutang</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ManualDebtModal onClose={()=>setModal(false)} onSave={addDebt} />}
    </div>
  );
}

function ManualDebtModal({ onClose, onSave }) {
  const [form, setForm] = useState({ supplier:"", amount:0, dueDate:"", note:"" });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Catat Hutang Manual</h3>
        <div className="form-grid">
          <div className="field" style={{gridColumn:"1 / -1"}}>
            <label>Nama Supplier</label>
            <input value={form.supplier} onChange={e=>setForm({...form, supplier:e.target.value})} />
          </div>
          <div className="field">
            <label>Jumlah Hutang</label>
            <input type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
          </div>
          <div className="field">
            <label>Tanggal Jatuh Tempo</label>
            <input type="date" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} />
          </div>
          <div className="field" style={{gridColumn:"1 / -1"}}>
            <label>Catatan</label>
            <textarea rows="2" value={form.note} onChange={e=>setForm({...form, note:e.target.value})}></textarea>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={()=>onSave({...form, amount:Number(form.amount)})} disabled={!form.supplier || !form.dueDate || !form.amount}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ---------- SALES HISTORY ----------
function SalesHistory({ ctx }) {
  const { sales } = ctx;
  const [search, setSearch] = useState("");
  const filtered = sales.filter(s=>s.id.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase()));
  const totalAll = filtered.reduce((a,s)=>a+s.total,0);

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Riwayat Penjualan</h2>
          <p>Semua transaksi penjualan yang sudah dicatat melalui kasir</p>
        </div>
        <span className="pill-badge">Total: {formatRp(totalAll)}</span>
      </div>

      <div className="search-bar">
        <input placeholder="Cari no. transaksi atau pelanggan..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>No. Transaksi</th><th>Tanggal</th><th>Pelanggan</th><th>Detail Item</th><th>Total</th><th>Pembayaran</th></tr></thead>
            <tbody>
              {filtered.slice().reverse().map(s=>(
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.date}</td>
                  <td>{s.customer}</td>
                  <td style={{whiteSpace:"normal", maxWidth:"320px"}}>{s.items.map(i=>`${i.name} x${i.qty}`).join(", ")}</td>
                  <td>{formatRp(s.total)}</td>
                  <td><span className="badge badge-neutral">{s.payment}</span></td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan="6"><div className="empty">Belum ada transaksi</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- CUSTOMERS ----------
function Customers({ ctx }) {
  const { customers, setCustomers } = ctx;
  const [modal, setModal] = useState(false);

  const addCustomer = (data) => {
    const newId = "C" + String(customers.length+1).padStart(3,"0");
    setCustomers(prev=>[...prev, {...data, id:newId, totalBelanja:0}]);
    setModal(false);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Data Pelanggan</h2>
          <p>Kelola data pelanggan, member, dan reseller</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Icon name="plus" /> Tambah Pelanggan</button>
      </div>

      <div className="grid grid-3" style={{marginBottom:"20px"}}>
        <div className="card stat-card">
          <div className="icon-circle bg-sage"><Icon name="customer" /></div>
          <div className="label">Total Pelanggan</div>
          <div className="value">{customers.length}</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-tan"><Icon name="customer" /></div>
          <div className="label">Member Aktif</div>
          <div className="value">{customers.filter(c=>c.type==="Member").length}</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-warn"><Icon name="customer" /></div>
          <div className="label">Reseller</div>
          <div className="value">{customers.filter(c=>c.type==="Reseller").length}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Nama</th><th>No. Telepon</th><th>Tipe</th><th>Hewan Peliharaan</th><th>Total Belanja</th></tr></thead>
            <tbody>
              {customers.map(c=>(
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td><span className={"badge " + (c.type==="Member"?"badge-ok":c.type==="Reseller"?"badge-warn":"badge-neutral")}>{c.type}</span></td>
                  <td>{c.pet}</td>
                  <td>{formatRp(c.totalBelanja)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <CustomerFormModal onClose={()=>setModal(false)} onSave={addCustomer} />}
    </div>
  );
}

function CustomerFormModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:"", phone:"", type:"Reguler", pet:"" });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Tambah Pelanggan</h3>
        <div className="form-grid">
          <div className="field" style={{gridColumn:"1 / -1"}}>
            <label>Nama</label>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </div>
          <div className="field">
            <label>No. Telepon</label>
            <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          </div>
          <div className="field">
            <label>Tipe Pelanggan</label>
            <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
              <option>Reguler</option>
              <option>Member</option>
              <option>Reseller</option>
            </select>
          </div>
          <div className="field" style={{gridColumn:"1 / -1"}}>
            <label>Hewan Peliharaan (opsional)</label>
            <input value={form.pet} onChange={e=>setForm({...form, pet:e.target.value})} placeholder="Contoh: Kucing - Mochi" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={()=>onSave(form)} disabled={!form.name}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ---------- REPORTS ----------
function Reports({ ctx }) {
  const { sales, purchases, products, debts } = ctx;

  const totalPenjualan = sales.reduce((a,s)=>a+s.total,0);
  const totalPembelian = purchases.reduce((a,p)=>a+p.total,0);

  // Estimate gross profit using sell price - buy price per item sold
  let totalModalTerjual = 0;
  sales.forEach(s=>{
    s.items.forEach(item=>{
      const prod = products.find(p=>p.id===item.id);
      if (prod) totalModalTerjual += prod.buyPrice * item.qty;
    });
  });
  const labaKotor = totalPenjualan - totalModalTerjual;

  // sales by category
  const categoryMap = {};
  sales.forEach(s=>{
    s.items.forEach(item=>{
      const prod = products.find(p=>p.id===item.id);
      const cat = prod ? prod.category : "Lainnya";
      categoryMap[cat] = (categoryMap[cat]||0) + item.qty * item.price;
    });
  });
  const maxCat = Math.max(...Object.values(categoryMap), 1);

  // best sellers
  const productSales = {};
  sales.forEach(s=>{
    s.items.forEach(item=>{
      productSales[item.name] = (productSales[item.name]||0) + item.qty;
    });
  });
  const bestSellers = Object.entries(productSales).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Laporan Usaha</h2>
          <p>Ringkasan keuangan dan performa penjualan toko</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="icon-circle bg-sage"><Icon name="sales" /></div>
          <div className="label">Total Penjualan</div>
          <div className="value">{formatRp(totalPenjualan)}</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-tan"><Icon name="purchase" /></div>
          <div className="label">Total Pembelian</div>
          <div className="value">{formatRp(totalPembelian)}</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-ok"><Icon name="money" /></div>
          <div className="label">Estimasi Laba Kotor</div>
          <div className="value">{formatRp(labaKotor)}</div>
          <div className="sub">dari barang yang sudah terjual</div>
        </div>
        <div className="card stat-card">
          <div className="icon-circle bg-danger"><Icon name="debt" /></div>
          <div className="label">Hutang Belum Lunas</div>
          <div className="value">{formatRp(debts.filter(d=>d.status==="Belum Lunas").reduce((a,d)=>a+d.amount,0))}</div>
        </div>
      </div>

      <div className="grid grid-2" style={{marginTop:"24px"}}>
        <div className="card">
          <h3 style={{marginBottom:"16px"}}>Penjualan per Kategori</h3>
          {Object.entries(categoryMap).length === 0 ? (
            <div className="empty">Belum ada data</div>
          ) : Object.entries(categoryMap).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>(
            <div key={cat} style={{marginBottom:"12px"}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:"13px", marginBottom:"4px"}}>
                <span style={{fontWeight:700}}>{cat}</span>
                <span style={{color:"var(--ink-soft)"}}>{formatRp(val)}</span>
              </div>
              <div style={{height:"10px", background:"var(--cream)", borderRadius:"99px", overflow:"hidden"}}>
                <div style={{height:"100%", width:(val/maxCat*100)+"%", background:"var(--sage)", borderRadius:"99px"}}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{marginBottom:"16px"}}>Produk Terlaris</h3>
          {bestSellers.length===0 ? (
            <div className="empty">Belum ada data</div>
          ) : (
            <table>
              <thead><tr><th>#</th><th>Produk</th><th>Terjual</th></tr></thead>
              <tbody>
                {bestSellers.map(([name,qty], idx)=>(
                  <tr key={name}>
                    <td>{idx+1}</td>
                    <td>{name}</td>
                    <td><span className="badge badge-ok">{qty} unit</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{marginTop:"24px"}}>
        <h3 style={{marginBottom:"16px"}}>Nilai Stok per Produk (Modal Tertanam)</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produk</th><th>Stok</th><th>Harga Beli</th><th>Nilai Modal</th></tr></thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.stock} {p.unit}</td>
                  <td>{formatRp(p.buyPrice)}</td>
                  <td>{formatRp(p.stock*p.buyPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);