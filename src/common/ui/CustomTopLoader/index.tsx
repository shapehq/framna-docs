'use client'

import { useRouter as useNextRouter, usePathname } from 'next/navigation';
import Router from 'next/router';
import 'node_modules/nprogress/nprogress.css';
import NProgress from 'nprogress';
import { useEffect } from 'react';

type CustomTopLoaderProps = {
  color?: string;
  initialPosition?: number;
  crawlSpeed?: number;
  height?: number;
  crawl?: boolean;
  showSpinner?: boolean;
  easing?: string;
  speed?: number;
  shadow?: string | false;
  template?: string;
  zIndex?: number;
  parentSelector?: string;
};

const CustomTopLoader: React.FC<CustomTopLoaderProps> = ({
  color = '#000',
  showSpinner = false,
  crawl = true,
  crawlSpeed = 600,
  easing = 'ease',
  speed = 600,
  template = '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
  zIndex = 100000000,
  parentSelector = 'body',
}) => {
  const router = useNextRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initNProgress = () => {
      // Ensure the parent exists before configuring NProgress
      const parentElement = document.querySelector(parentSelector);
      if (!parentElement) {
        return;
      }

      NProgress.configure({
        parent: parentSelector,
        showSpinner,
        trickle: crawl,
        trickleSpeed: crawlSpeed,
        easing,
        speed,
        template,
      });

      const handleStart = () => {
        if (document.querySelector(parentSelector)) {
          NProgress.start();
        }
      };
      const handleComplete = () => NProgress.done();

      Router.events.on('routeChangeStart', handleStart);
      Router.events.on('routeChangeComplete', handleComplete);
      Router.events.on('routeChangeError', handleComplete);

      return () => {
        Router.events.off('routeChangeStart', handleStart);
        Router.events.off('routeChangeComplete', handleComplete);
        Router.events.off('routeChangeError', handleComplete);
        NProgress.remove(); // Ensure NProgress cleans up
      };
    };

    // Wait until the parent element appears before initializing NProgress
    const waitForParent = setInterval(() => {
      if (document.querySelector(parentSelector)) {
        clearInterval(waitForParent);
        initNProgress();
      }
    }, 100); // Checks every 100ms

    return () => clearInterval(waitForParent);
  }, [
    router,
    parentSelector,
    showSpinner,
    crawl,
    crawlSpeed,
    easing,
    speed,
    template,
  ]);

  // Re-run when the pathname changes to ensure progress bar finishes loading
  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return (
    <style>
      {`
        #nprogress .bar {
          background-color: ${color};
          z-index: ${zIndex}
        }
        #nprogress .peg {
          display: none;
        }
      `}
    </style>
  )
};

export default CustomTopLoader;