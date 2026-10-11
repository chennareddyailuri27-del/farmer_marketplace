const starterProducts = [
  {id:1,name:'Fresh Tomatoes',price:35,unit:'kg',farmer:'Green Valley Farm',emoji:'🍅'},
  {id:2,name:'Organic Spinach',price:25,unit:'bunch',farmer:'Sunrise Fields',emoji:'🥬'},
  {id:3,name:'Sweet Carrots',price:40,unit:'kg',farmer:'Happy Harvest',emoji:'🥕'},
  {id:4,name:'Farm Potatoes',price:30,unit:'kg',farmer:'Green Valley Farm',emoji:'🥔'},
  {id:5,name:'Fresh Corn',price:20,unit:'piece',farmer:'Meadow Farm',emoji:'🌽'},
  {id:6,name:'Red Apples',price:120,unit:'kg',farmer:'Hilltop Orchard',emoji:'🍎'}
];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
let products = read('fm-products', starterProducts);
let cart = read('fm-cart', []);
const money = n => '₹' + Number(n).toFixed(2);
function save(){localStorage.setItem('fm-products',JSON.stringify(products));localStorage.setItem('fm-cart',JSON.stringify(cart));}
function renderProducts(){
  const term=document.getElementById('search').value.trim().toLowerCase();
  const list=products.filter(p=>(p.name+' '+p.farmer).toLowerCase().includes(term));
  document.getElementById('product-list').innerHTML=list.length?list.map(p=>`
    <article class="product-card"><div class="product-art">${escapeHtml(p.emoji||'🌱')}</div><div class="product-info">
    <h3>${escapeHtml(p.name)}</h3><p class="farm">By ${escapeHtml(p.farmer)}</p>
    <div class="product-bottom"><span class="price">${money(p.price)} / ${escapeHtml(p.unit)}</span>
    <button class="small-btn" data-add="${p.id}">Add to cart</button></div></div></article>`).join(''):'<p class="empty">No products found. Try another search.</p>';
}
function renderCart(){
  const host=document.getElementById('cart-items');
  const count=cart.reduce((sum,item)=>sum+item.qty,0);
  document.getElementById('cart-count').textContent=count;
  if(!cart.length){host.innerHTML='<p class="empty">Your cart is empty. Add some fresh produce above.</p>';}
  else host.innerHTML=cart.map(item=>{const p=products.find(x=>x.id===item.id);if(!p)return '';return `<div class="cart-row"><div><strong>${escapeHtml(p.name)}</strong><br><small>${money(p.price)} / ${escapeHtml(p.unit)}</small></div><div class="cart-controls"><button data-change="${p.id}" data-delta="-1" aria-label="Remove one">−</button><span>${item.qty}</span><button data-change="${p.id}" data-delta="1" aria-label="Add one">+</button><strong>${money(p.price*item.qty)}</strong></div></div>`;}).join('');
  const total=cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id);return sum+(p?p.price*item.qty:0)},0);
  document.getElementById('cart-total').textContent='Total: '+money(total);
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.getElementById('search').addEventListener('input',renderProducts);
document.getElementById('product-list').addEventListener('click',e=>{
  const button=e.target.closest('[data-add]');if(!button)return;
  const id=Number(button.dataset.add);const found=cart.find(x=>x.id===id);
  if(found)found.qty++;else cart.push({id,qty:1});save();renderCart();
});
document.getElementById('cart-items').addEventListener('click',e=>{
  const button=e.target.closest('[data-change]');if(!button)return;
  const id=Number(button.dataset.change),delta=Number(button.dataset.delta);
  const item=cart.find(x=>x.id===id);if(item)item.qty+=delta;
  cart=cart.filter(x=>x.qty>0);save();renderCart();
});
document.getElementById('product-form').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('product-name').value.trim();
  const price=Number(document.getElementById('product-price').value);
  const unit=document.getElementById('product-unit').value.trim();
  const farmer=document.getElementById('farmer-name').value.trim();
  const emoji=document.getElementById('product-emoji').value.trim()||'🌱';
  if(!name||!unit||!farmer||price<=0)return;
  products.unshift({id:Date.now(),name,price,unit,farmer,emoji});save();renderProducts();e.target.reset();
  document.getElementById('form-message').textContent='Product added successfully!';
});
document.getElementById('checkout').addEventListener('click',()=>{
  const msg=document.getElementById('order-message');
  if(!cart.length){msg.textContent='Add products to your cart before placing an order.';return;}
  const total=cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id);return sum+(p?p.price*item.qty:0)},0);
  msg.textContent=`Demo order placed for ${money(total)}. No payment was taken.`;
  cart=[];save();renderCart();
});
renderProducts();renderCart();
