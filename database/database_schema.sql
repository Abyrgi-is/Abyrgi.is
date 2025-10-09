-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE abyrgi.car_models (
  car_model_id uuid NOT NULL DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  model_year numeric NOT NULL,
  CONSTRAINT car_models_pkey PRIMARY KEY (car_model_id)
);
CREATE TABLE abyrgi.cars (
  car_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  car_vin text,
  color text,
  manual boolean,
  plate text,
  car_model_id uuid NOT NULL,
  CONSTRAINT cars_pkey PRIMARY KEY (car_id),
  CONSTRAINT fk_auth_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT cars_car_model_id_fkey FOREIGN KEY (car_model_id) REFERENCES abyrgi.car_models(car_model_id)
);
CREATE TABLE abyrgi.confirmation_codes (
  code_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  CONSTRAINT confirmation_codes_pkey PRIMARY KEY (code_id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE abyrgi.locations (
  location_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  address text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  user_id uuid,
  CONSTRAINT locations_pkey PRIMARY KEY (location_id),
  CONSTRAINT fk_location_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE abyrgi.orders (
  order_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  staff_id uuid,
  pickup_location_id uuid,
  dropoff_location_id uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  notes text,
  car_id uuid,
  CONSTRAINT orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_staff FOREIGN KEY (staff_id) REFERENCES auth.users(id),
  CONSTRAINT fk_pickup_location FOREIGN KEY (pickup_location_id) REFERENCES abyrgi.locations(location_id),
  CONSTRAINT fk_dropoff_location FOREIGN KEY (dropoff_location_id) REFERENCES abyrgi.locations(location_id),
  CONSTRAINT orders_car_id_fkey FOREIGN KEY (car_id) REFERENCES abyrgi.cars(car_id)
);
CREATE TABLE abyrgi.profiles (
  id uuid NOT NULL,
  name text NOT NULL,
  username text UNIQUE,
  address text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_auth_user FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE abyrgi.receipts (
  receipt_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  price smallint NOT NULL,
  status text DEFAULT 'unpaid'::text,
  CONSTRAINT receipts_pkey PRIMARY KEY (receipt_id),
  CONSTRAINT receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE abyrgi.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  rating smallint NOT NULL,
  user_id uuid,
  order_id uuid,
  review_text text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES abyrgi.orders(order_id)
);
CREATE TABLE abyrgi.rides (
  ride_id uuid NOT NULL DEFAULT gen_random_uuid(),
  car_id uuid,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  staff_location_id uuid,
  car_location_id uuid,
  CONSTRAINT rides_pkey PRIMARY KEY (ride_id),
  CONSTRAINT fk_car FOREIGN KEY (car_id) REFERENCES abyrgi.cars(car_id),
  CONSTRAINT fk_auth_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_staff_location FOREIGN KEY (staff_location_id) REFERENCES abyrgi.locations(location_id),
  CONSTRAINT fk_car_location FOREIGN KEY (car_location_id) REFERENCES abyrgi.locations(location_id)
);
CREATE TABLE abyrgi.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE abyrgi.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  dark_theme boolean DEFAULT false,
  language text DEFAULT 'icelandic'::text,
  gmail_announcements boolean DEFAULT false,
  sms_announcements boolean DEFAULT false,
  push_notifications boolean DEFAULT false,
  share_location boolean DEFAULT false,
  allow_data_sharing boolean DEFAULT false,
  high_constrant boolean DEFAULT false,
  larger_font boolean DEFAULT false,
  less_animation boolean DEFAULT false,
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE abyrgi.user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES abyrgi.roles(id)
);
