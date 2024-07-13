import React from 'react'
import clsx from 'clsx'

import style from './ChatBubble.module.css'
import ProductCard from './ProductCard'

function ChatBubble() {
  return (
    <div className={style.container}>
      <div className={clsx(style.bubble, style.left)}>
        I’m looking for Bestselling Bags for women
        <div className={style.time}>12:46 PM</div>
      </div>
      <div className={clsx(style.bubble, style.right)}>
        Hey! Here are our Bestsellers, take a look 👇
        <div className={style.time}>12:46 PM</div>
      </div>
      <div className={style.productsCarousel}>
        {[
          {
            id: 'gid://shopify/Product/7762223497445',
            images: [
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/jeju-3-step-hydration-ritual.jpg?v=1683282216&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/pilgrim-jeju-3-step-hydration-ritual-684260.jpg?v=1683282220&width=512',
            ],
            name: 'K-Beauty 3 Step Hydration Ritual',
            price: '199',
            rating: '4.56',
          },
          {
            id: 'gid://shopify/Product/7762223694053',
            images: [
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/jeju-daily-ritual-for-oily-skin.jpg?v=1683282258&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/pilgrim-jeju-daily-ritual-for-oily-skin-640570.jpg?v=1683282260&width=512',
            ],
            name: 'K-Beauty Daily Ritual for Oily Skin',
            price: '449',
            rating: '1.88',
          },
          {
            id: 'gid://shopify/Product/7762223923429',
            images: [
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/jeju-argan-oil-hair-ritual.jpg?v=1683282233&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/pilgrim-jeju-argan-oil-hair-ritual-633619.jpg?v=1683282236&width=512',
            ],
            name: 'K-Beauty Argan Oil Hair Ritual',
            price: '349',
            rating: '2.27',
          },
          {
            id: 'gid://shopify/Product/7768274469093',
            images: [
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/products/volcanic-lava-ash-face-wash-with-yugdugu-white-lotus-618329.jpg?v=1683285537&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/Firstimage_79ae7387-1031-493c-b624-a39a126f2699.jpg?v=1691758114&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/What_s-in-it_e7c48375-d723-4af2-a18b-450831a7cd73.jpg?v=1691758136&width=512',
            ],
            name: 'Volcanic Lava Ash Face Wash with Yugdugu & White Lotus',
            price: '399',
            rating: '4.68',
          },
          {
            id: 'gid://shopify/Product/7662692008165',
            images: [
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/White-background-_1080x1080_f53cec56-2205-4126-89a6-f6b6e4988e9f.jpg?v=1701685255&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/First-image-_1080x1080_d84cbdfa-6ecf-4460-b674-d57a8c4f838b.jpg?v=1701685255&width=512',
              'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/What_s-in-it-_1080x1080_f7bcf386-0a5a-418a-9109-c02b1d452bdf.jpg?v=1701685255&width=512',
            ],
            name: 'Squalane Glow Crème Serum',
            price: '149',
            rating: '2.99',
          },
        ].map(p => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  )
}

export default ChatBubble
