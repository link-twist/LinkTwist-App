import { loadingController } from '@ionic/vue';

export const loaderService = {
  async startLoader() {
    const loader = await loadingController.create({
      cssClass: 'loader-style',
      duration: 10000,
      showBackdrop: false
    });

    await loader.present();
    return loader;
  },

  async stopLoading(loader: any) {
    if (loader) {
      await new Promise(f => setTimeout(f, 50));
      loader.dismiss();
    }
  }
};
