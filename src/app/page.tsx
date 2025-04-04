// src/app/page.tsx
import React from 'react';
import ImageBanner from '@/component/ImageBanner';
import BannerStrip from '@/component/BannerStrip';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <BannerStrip />
      <ImageBanner />
      <div className={styles.contentSection}>
      </div>
    </div>
  );
}