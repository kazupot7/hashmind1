import axios from "axios";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";

const $http = axios.create({
  baseURL: "https://gql.hashnode.com",
  timeout: 30000,
});

export type CreatePostType = {
  title: string;
  subtitle: string;
  contentMarkdown: string;
  tags: {
    id: string;
  }[];
  coverImageOptions?: {
    coverImageURL: string;
  };
  slug?: string;
  publicationId: string;
  apiKey: string;
  metaTags?: {
    title: string;
    description: string;
    image: string;
  };
};

type FuncResp = {
  error?: null | string;
  success?: null | string;
  data?: null;
};

class HashnodeService {
  async createPost({
    title,
    subtitle,
    contentMarkdown,
    slug,
    publicationId,
    apiKey,
    ...config
  }: CreatePostType) {
    if (!apiKey || !publicationId) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Unauthorized, missing api key or publication id`,
        401
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };
    try {
      const reqBody = {
        query: `mutation PublishPost($input: PublishPostInput!) {
            publishPost(input: $input) {
                post {
                    id
                    slug
                    title
                    subtitle
                }
            }
        }`,
        variables: {
          input: {
            title,
            subtitle,
            publicationId,
            contentMarkdown,
            slug,
            ...config,
          },
        },
      };

      // console.log(reqBody);

      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data?.data;
      funcResp.success = "Article created successfully";
      funcResp.data = respData.publishPost.post;
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg);
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Something went wrong creating article.`,
        400
      );
    }
  }
}

const hashnodeService = new HashnodeService();
export default hashnodeService;