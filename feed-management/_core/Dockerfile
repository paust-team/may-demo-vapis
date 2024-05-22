FROM ghcr.io/supabase/edge-runtime:v1.2.18

COPY ./ /feed-management
CMD [ "start", "--main-service", "/feed-management/_core" ]