// import Link from "next/link";

// import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from '~/trpc/server'
import styles from './index.module.css'
import { ProductCard } from './_components/ProductCard'
import Dock from './_components/Dock'
import Header from './_components/Page/Header'

export default async function Home() {
  const output = await api.products.getTop10()

  return (
    <HydrateClient>
      <main className={styles.main}>
        <Header />

        <div className={styles.productsContainer}>
          {output ? output.reverse().map(p => <ProductCard key={p.id} p={p} />) : 'Loading tRPC query...'}
        </div>

        <Dock />
      </main>
    </HydrateClient>
  )
}
