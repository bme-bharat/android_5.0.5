import { Image } from 'react-native';
import apiClient from '../ApiClient';
import { getSignedUrl } from './signedUrls';
import { generateAvatarFromName } from './useInitialsAvatar';
import companyImage from '../../images/homepage/buliding.jpg';

const Company = Image.resolveAssetSource(companyImage).uri;

export const fetchJobs = async () => {
  try {
    const response = await apiClient.post('/getAllJobPosts', {
      command: "getAllJobPosts",
      limit: 10,
    });

    if (response.data.status !== "success") {
      return { jobs: [] };
    }

    const jobsData = response.data.response || [];

    const processedJobs = await Promise.all(
      jobsData.map(async (job) => {
        let image = null;

        // If fileKey exists -> get signed URL
        if (job.fileKey) {
          try {
            const signedUrl = await getSignedUrl(job.post_id, job.fileKey);
            if (signedUrl && signedUrl[job.post_id]) {
              image = signedUrl[job.post_id];
            }
          } catch (error) {
            console.warn(`Failed to get signed URL for job ${job.post_id}:`, error);
          }
        }

        // Fallback avatar
        const companyAvatar = generateAvatarFromName(job.company_name);
        return {
          ...job,
          image,          // final image field (UI will use this)
          companyAvatar,  // avatar fallback
        };
      })
    );
    return { jobs: processedJobs };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [] };
  }
};





export const fetchTrendingPosts = async () => {

  try {
    const response = await apiClient.post('/getAllTrendingPosts', {
      command: "getAllTrendingPosts",
      limit: 10,
    });

    if (response.data.status !== "success") return [];

    const trendingData = response.data.response || [];

    const enrichedPosts = await Promise.all(trendingData.map(async (post) => {
      let mediaUrl = null;
      let authorImage = null;
      let avatar = null;

      try {

        const mediaSignedUrl = await getSignedUrl(post.forum_id, post.fileKey);
        if (mediaSignedUrl && mediaSignedUrl[post.forum_id]) mediaUrl = mediaSignedUrl[post.forum_id];

      } catch (e) { }

      try {
        if (post.author_fileKey) {
          const authorSignedUrl = await getSignedUrl(post.forum_id, post.author_fileKey);
          if (authorSignedUrl && authorSignedUrl[post.forum_id]) authorImage = authorSignedUrl[post.forum_id];
        }
      } catch (e) { }

      if (!authorImage) avatar = generateAvatarFromName(post.author || 'Unknown');

      return { ...post, mediaUrl, authorImage, avatar };
    }));

    return enrichedPosts;

  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return [];
  }
};


export const fetchLatestPosts = async () => {

  try {
    const response = await apiClient.post('/getLatestPosts', {
      command: "getLatestPosts",
      limit: 10,
    });

    if (response.data.status !== "success") return [];

    const latestData = response.data.response || [];

    const enrichedPosts = await Promise.all(latestData.map(async (post) => {
      let mediaUrl = null;
      let authorImage = null;
      let avatar = null;

      try {
      
          const mediaSignedUrl = await getSignedUrl(post.forum_id, post.fileKey);
          if (mediaSignedUrl && mediaSignedUrl[post.forum_id]) mediaUrl = mediaSignedUrl[post.forum_id];
     
      } catch (e) { }

      try {
        if (post.author_fileKey) {
          const authorSignedUrl = await getSignedUrl(post.forum_id, post.author_fileKey);
          if (authorSignedUrl && authorSignedUrl[post.forum_id]) authorImage = authorSignedUrl[post.forum_id];
        }
      } catch (e) { }

      if (!authorImage) avatar = generateAvatarFromName(post.author || 'Unknown');

      return { ...post, mediaUrl, authorImage, avatar };
    }));
// console.log('enrichedPosts',enrichedPosts)
    return enrichedPosts;

  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
};


export const fetchProducts = async () => {
  try {
    const response = await apiClient.post('/getAllProducts', { command: "getAllProducts", limit: 10 });
    if (response.data.status !== "success") return { products: [] };

    const productsData = response.data.response || [];

    const processedProducts = await Promise.all(
      productsData.map(async (product) => {
        let image = Company; // default fallback

        const firstImageKey = product.images?.[0]; // only the first fileKey
        if (firstImageKey) {
          try {
            const signedUrl = await getSignedUrl(product.product_id, firstImageKey);
            if (signedUrl && signedUrl[product.product_id]) {
              image = signedUrl[product.product_id];
            }
          } catch (e) {
            console.warn(`Failed to get signed URL for product ${product.product_id}`, e);
          }
        }

        return {
          ...product,
          image, // single image URL for UI
        };
      })
    );

    return { products: processedProducts };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [] };
  }
};



export const fetchServices = async () => {
  try {
    const response = await apiClient.post('/getAllServices', { command: "getAllServices", limit: 10 });
    if (response.data.status !== "success") return { services: [] };

    const servicesData = response.data.response || [];

    const processedServices = await Promise.all(
      servicesData.map(async (service) => {
        let image = Company; // default fallback

        const firstImageKey = service.images?.[0]; // only the first fileKey
        if (firstImageKey) {
          try {
            const signedUrl = await getSignedUrl(service.service_id, firstImageKey);
            if (signedUrl && signedUrl[service.service_id]) {
              image = signedUrl[service.service_id];
            }
          } catch (e) {
            console.warn(`Failed to get signed URL for service ${service.service_id}`, e);
          }
        }

        return {
          ...service,
          image, // single image URL for UI
        };
      })
    );

    return { services: processedServices };
  } catch (error) {
    console.error("Error fetching services:", error);
    return { services: [] };
  }
};

