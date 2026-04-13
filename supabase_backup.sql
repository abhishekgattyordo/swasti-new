--
-- PostgreSQL database dump
--

\restrict p7vyXHvomjdvMmlbQKTJPuFpfJlh6yGcmGhMngDvg9XRx3Efpagw2JQBZIhaun4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: generate_patient_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_patient_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.patient_id = CAST(EXTRACT(EPOCH FROM NOW()) * 1000 AS BIGINT) * 10000 + FLOOR(RANDOM() * 10000)::INT;
    RETURN NEW;
END;
$$;


--
-- Name: generate_registration_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_registration_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.registration_id = 'REG-' || UPPER(SUBSTRING(MD5(EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name_en, role, created_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'patient', NOW());
  RETURN NEW;
END;
$$;


--
-- Name: update_bill_total(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_bill_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE ip_bills
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM ip_bill_items
    WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  RETURN NULL;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: admissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admissions (
    id integer NOT NULL,
    patient_id bigint NOT NULL,
    admission_date date NOT NULL,
    ward_id integer,
    room_id integer,
    bed_id integer,
    reason text,
    diagnosis text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    discharge_date date,
    discharge_id character varying(50),
    primary_consultant character varying(255),
    consultant_dept character varying(255),
    wing character varying(100)
);


--
-- Name: admissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admissions_id_seq OWNED BY public.admissions.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    patient_id bigint,
    doctor_id integer NOT NULL,
    appointment_date date NOT NULL,
    appointment_time character varying(20) NOT NULL,
    consultation_type character varying(20),
    notes text,
    status character varying(20) DEFAULT 'BOOKED'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    consultation_fee numeric(10,2) DEFAULT 0,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    invoice_number character varying(20),
    CONSTRAINT appointments_consultation_type_check CHECK (((consultation_type)::text = ANY ((ARRAY['in-person'::character varying, 'teleconsultation'::character varying])::text[]))),
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['BOOKED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: beds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beds (
    id integer NOT NULL,
    ward_id integer NOT NULL,
    room_id integer,
    bed_number character varying(50) NOT NULL,
    type character varying(50) NOT NULL,
    floor_number integer NOT NULL,
    status character varying(50) NOT NULL,
    patient_category character varying(50) NOT NULL,
    attributes jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    occupied_by bigint,
    occupied_at timestamp without time zone,
    CONSTRAINT beds_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'occupied'::character varying, 'cleaning'::character varying, 'maintenance'::character varying, 'reserved'::character varying])::text[])))
);


--
-- Name: beds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.beds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: beds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.beds_id_seq OWNED BY public.beds.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: doctor_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_availability (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    slot_duration_minutes integer DEFAULT 30,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_availability_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: doctor_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_availability_id_seq OWNED BY public.doctor_availability.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    specialty character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    license_number character varying(100) NOT NULL,
    date_of_birth date,
    date_joined date NOT NULL,
    address text,
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    country character varying(100),
    qualifications jsonb DEFAULT '[]'::jsonb,
    experience integer,
    bio text,
    status character varying(20) DEFAULT 'active'::character varying,
    avatar character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctors_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'on-leave'::character varying, 'inactive'::character varying])::text[])))
);


--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: emergency_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_contacts (
    id integer NOT NULL,
    patient_id bigint NOT NULL,
    name character varying(255),
    relation character varying(100),
    phone character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emergency_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emergency_contacts_id_seq OWNED BY public.emergency_contacts.id;


--
-- Name: floors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.floors (
    id integer NOT NULL,
    floor_number integer NOT NULL,
    name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: floors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.floors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: floors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.floors_id_seq OWNED BY public.floors.id;


--
-- Name: insurance_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insurance_details (
    id integer NOT NULL,
    patient_id bigint NOT NULL,
    insurance_provider character varying(100),
    policy_number character varying(50),
    valid_until date,
    group_id character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: insurance_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.insurance_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: insurance_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.insurance_details_id_seq OWNED BY public.insurance_details.id;


--
-- Name: ip_bill_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ip_bill_items (
    id integer NOT NULL,
    bill_id integer NOT NULL,
    medicine_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    sale_item_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: ip_bill_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ip_bill_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ip_bill_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ip_bill_items_id_seq OWNED BY public.ip_bill_items.id;


--
-- Name: ip_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ip_bills (
    id integer NOT NULL,
    sale_id integer,
    patient_id character varying(50),
    admission_id integer,
    bill_number character varying(50) NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'UNPAID'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: ip_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ip_bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ip_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ip_bills_id_seq OWNED BY public.ip_bills.id;


--
-- Name: ip_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ip_payments (
    id integer NOT NULL,
    bill_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(20),
    transaction_id character varying(100),
    payment_date timestamp without time zone DEFAULT now()
);


--
-- Name: ip_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ip_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ip_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ip_payments_id_seq OWNED BY public.ip_payments.id;


--
-- Name: lab_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id text,
    patient_id text,
    patient_name text,
    visit_type text,
    visit_id text,
    tests jsonb,
    total_amount numeric,
    status text DEFAULT 'Ordered'::text,
    order_date date,
    collected_date date,
    completed_date date,
    billing_entry_id text,
    results jsonb,
    created_at timestamp without time zone DEFAULT now(),
    admission_id text,
    admission_date date,
    ward_id integer,
    bed_id integer
);


--
-- Name: lab_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_name text NOT NULL,
    test_code text NOT NULL,
    category text,
    price numeric,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: medical_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_history (
    id integer NOT NULL,
    patient_id bigint NOT NULL,
    allergy character varying(100) NOT NULL,
    chronic_condition character varying(100) NOT NULL,
    medications text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: medical_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medical_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medical_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medical_history_id_seq OWNED BY public.medical_history.id;


--
-- Name: medicines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medicines (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    generic_name character varying(255),
    brand_name character varying(255),
    category character varying(100) NOT NULL,
    unit character varying(50) NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    selling_price numeric(10,2) NOT NULL,
    mrp numeric(10,2),
    tax_percent numeric(5,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reorder_level integer DEFAULT 0
);


--
-- Name: medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medicines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medicines_id_seq OWNED BY public.medicines.id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    patient_id bigint NOT NULL,
    full_name_en character varying(100) NOT NULL,
    full_name_hi character varying(100),
    dob date NOT NULL,
    gender character varying(20) NOT NULL,
    address text NOT NULL,
    city character varying(100),
    state character varying(50) NOT NULL,
    country character varying(100) DEFAULT 'India'::character varying,
    pincode character varying(6) NOT NULL,
    phone character varying(20),
    email character varying(255),
    blood_group character varying(10),
    registration_step integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    added_by_doctor_id integer,
    CONSTRAINT patients_blood_group_check CHECK (((blood_group)::text = ANY ((ARRAY['A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'AB+'::character varying, 'AB-'::character varying, 'O+'::character varying, 'O-'::character varying, 'Unknown'::character varying])::text[]))),
    CONSTRAINT patients_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying, 'prefer_not_to_say'::character varying])::text[])))
);


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescription_items (
    id integer NOT NULL,
    prescription_id integer,
    medicine_id integer,
    prescribed_qty integer NOT NULL,
    dispensed_qty integer DEFAULT 0,
    instructions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prescription_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prescription_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prescription_items_id_seq OWNED BY public.prescription_items.id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescriptions (
    id integer NOT NULL,
    appointment_id uuid NOT NULL,
    medication_name character varying(255) NOT NULL,
    category character varying(100),
    dosage character varying(100) NOT NULL,
    frequency character varying(100),
    duration character varying(100),
    instructions text,
    recorded_by character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_items (
    id integer NOT NULL,
    purchase_id integer,
    medicine_id integer,
    batch_no character varying(100) NOT NULL,
    expiry_date date NOT NULL,
    quantity integer NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    mrp numeric(10,2) NOT NULL,
    tax_percent numeric(5,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_items_id_seq OWNED BY public.purchase_items.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    supplier_id integer,
    invoice_no character varying(100) NOT NULL,
    invoice_date date NOT NULL,
    gst_no character varying(50),
    payment_mode character varying(50),
    subtotal numeric(10,2) NOT NULL,
    tax_total numeric(10,2) NOT NULL,
    grand_total numeric(10,2) NOT NULL,
    is_delivered boolean DEFAULT false,
    stock_updated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    patient_id bigint NOT NULL,
    registration_id character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT registrations_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'INACTIVE'::character varying, 'SUSPENDED'::character varying])::text[])))
);


--
-- Name: registration_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.registration_details AS
 SELECT p.patient_id,
    p.full_name_en,
    p.full_name_hi,
    p.dob,
    p.gender,
    p.address,
    p.city,
    p.state,
    p.country,
    p.pincode,
    p.phone,
    p.email,
    p.blood_group,
    p.registration_step,
    p.created_at,
    p.updated_at,
    i.insurance_provider,
    i.policy_number,
    i.valid_until,
    i.group_id,
    r.registration_id,
    r.status AS registration_status,
    r.completed_at
   FROM ((public.patients p
     LEFT JOIN public.insurance_details i ON ((p.patient_id = i.patient_id)))
     LEFT JOIN public.registrations r ON ((p.patient_id = r.patient_id)));


--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    ward_id integer NOT NULL,
    room_number character varying(50) NOT NULL,
    name character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer,
    medicine_id integer,
    batch_no character varying(100),
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    tax_percent numeric(5,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    patient_id bigint,
    walkin_name character varying(255),
    doctor_name character varying(255),
    walkin_phone character varying(50),
    walkin_address text,
    sale_date date NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_total numeric(10,2) NOT NULL,
    discount_total numeric(10,2) DEFAULT 0,
    grand_total numeric(10,2) NOT NULL,
    payment_mode character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    prescription_id integer,
    stock_updated boolean DEFAULT false
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialties (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    department character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: specialties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.specialties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: specialties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.specialties_id_seq OWNED BY public.specialties.id;


--
-- Name: stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock (
    id integer NOT NULL,
    medicine_id integer,
    batch_no character varying(100) NOT NULL,
    expiry_date date NOT NULL,
    quantity integer NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    mrp numeric(10,2) NOT NULL,
    delivered_manual integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustments (
    id integer NOT NULL,
    medicine_id integer NOT NULL,
    batch_no character varying(100) NOT NULL,
    adjustment_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    reason text NOT NULL,
    previous_quantity integer NOT NULL,
    new_quantity integer NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stock_adjustments_quantity_check CHECK ((quantity > 0))
);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_adjustments_id_seq OWNED BY public.stock_adjustments.id;


--
-- Name: stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_id_seq OWNED BY public.stock.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    phone character varying(50),
    email character varying(255),
    address text,
    gst_no character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    full_name_en character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    patient_id character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    doctor_id bigint,
    auth_user_id uuid,
    password character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['patient'::character varying, 'doctor'::character varying, 'admin'::character varying, 'pharmacy'::character varying, 'helpdesk'::character varying, 'billing'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visit_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visit_details (
    id integer NOT NULL,
    appointment_id uuid NOT NULL,
    diagnosis text,
    icd10_code character varying(20),
    clinical_notes text,
    follow_up_date date,
    patient_instructions text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: visit_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visit_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visit_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visit_details_id_seq OWNED BY public.visit_details.id;


--
-- Name: visit_prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visit_prescriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visit_prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visit_prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: vitals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vitals (
    id integer NOT NULL,
    appointment_id uuid NOT NULL,
    bp character varying(20),
    hr integer,
    temp numeric(4,2),
    weight numeric(5,2),
    rr integer,
    spo2 integer,
    recorded_by character varying(100),
    recorded_at timestamp without time zone DEFAULT now()
);


--
-- Name: vitals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vitals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vitals_id_seq OWNED BY public.vitals.id;


--
-- Name: ward_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ward_transfers (
    id integer NOT NULL,
    admission_id integer NOT NULL,
    ward_id integer NOT NULL,
    from_date date NOT NULL,
    to_date date,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: ward_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ward_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ward_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ward_transfers_id_seq OWNED BY public.ward_transfers.id;


--
-- Name: wards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wards (
    id integer NOT NULL,
    floor_id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    patient_category character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    daily_rate numeric(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT wards_patient_category_check CHECK (((patient_category)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Children'::character varying, 'Mixed'::character varying])::text[]))),
    CONSTRAINT wards_type_check CHECK (((type)::text = ANY ((ARRAY['General'::character varying, 'Semi-Special'::character varying, 'Special'::character varying, 'VIP'::character varying, 'ICU'::character varying, 'Pediatric'::character varying])::text[])))
);


--
-- Name: wards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wards_id_seq OWNED BY public.wards.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: admissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions ALTER COLUMN id SET DEFAULT nextval('public.admissions_id_seq'::regclass);


--
-- Name: beds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds ALTER COLUMN id SET DEFAULT nextval('public.beds_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: doctor_availability id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_availability ALTER COLUMN id SET DEFAULT nextval('public.doctor_availability_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: emergency_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts ALTER COLUMN id SET DEFAULT nextval('public.emergency_contacts_id_seq'::regclass);


--
-- Name: floors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.floors ALTER COLUMN id SET DEFAULT nextval('public.floors_id_seq'::regclass);


--
-- Name: insurance_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_details ALTER COLUMN id SET DEFAULT nextval('public.insurance_details_id_seq'::regclass);


--
-- Name: ip_bill_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bill_items ALTER COLUMN id SET DEFAULT nextval('public.ip_bill_items_id_seq'::regclass);


--
-- Name: ip_bills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bills ALTER COLUMN id SET DEFAULT nextval('public.ip_bills_id_seq'::regclass);


--
-- Name: ip_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_payments ALTER COLUMN id SET DEFAULT nextval('public.ip_payments_id_seq'::regclass);


--
-- Name: medical_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_history ALTER COLUMN id SET DEFAULT nextval('public.medical_history_id_seq'::regclass);


--
-- Name: medicines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicines ALTER COLUMN id SET DEFAULT nextval('public.medicines_id_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: prescription_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_items ALTER COLUMN id SET DEFAULT nextval('public.prescription_items_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.visit_prescriptions_id_seq'::regclass);


--
-- Name: purchase_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_items_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: specialties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties ALTER COLUMN id SET DEFAULT nextval('public.specialties_id_seq'::regclass);


--
-- Name: stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock ALTER COLUMN id SET DEFAULT nextval('public.stock_id_seq'::regclass);


--
-- Name: stock_adjustments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments ALTER COLUMN id SET DEFAULT nextval('public.stock_adjustments_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visit_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_details ALTER COLUMN id SET DEFAULT nextval('public.visit_details_id_seq'::regclass);


--
-- Name: vitals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals ALTER COLUMN id SET DEFAULT nextval('public.vitals_id_seq'::regclass);


--
-- Name: ward_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_transfers ALTER COLUMN id SET DEFAULT nextval('public.ward_transfers_id_seq'::regclass);


--
-- Name: wards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards ALTER COLUMN id SET DEFAULT nextval('public.wards_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
572d0b22-e590-4dd6-a64b-19e9a3dbd048	572d0b22-e590-4dd6-a64b-19e9a3dbd048	{"sub": "572d0b22-e590-4dd6-a64b-19e9a3dbd048", "email": "bonoweso@fxzig.com", "email_verified": true, "phone_verified": false}	email	2026-03-26 09:06:37.090875+00	2026-03-26 09:06:37.091447+00	2026-03-26 09:06:37.091447+00	697450fb-b19f-4d23-a05f-8d056365525c
941d29b5-c66f-4f5e-bc75-a1da83842e5b	941d29b5-c66f-4f5e-bc75-a1da83842e5b	{"sub": "941d29b5-c66f-4f5e-bc75-a1da83842e5b", "email": "kylysyha@forexzig.com", "email_verified": true, "phone_verified": false}	email	2026-03-26 09:23:54.300181+00	2026-03-26 09:23:54.300518+00	2026-03-26 09:23:54.300518+00	c30c20bf-9cf6-4766-80a5-45b68bc842dd
01ce5190-59c2-4df5-9190-fa40b2eacea5	01ce5190-59c2-4df5-9190-fa40b2eacea5	{"sub": "01ce5190-59c2-4df5-9190-fa40b2eacea5", "email": "doctor1@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-26 11:00:44.737773+00	2026-03-26 11:00:44.737828+00	2026-03-26 11:00:44.737828+00	33b19635-cb10-42fc-b7de-6318eb9d7b62
6f1eb37e-fe79-4ce0-9149-4fdc451e131a	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	{"sub": "6f1eb37e-fe79-4ce0-9149-4fdc451e131a", "email": "patient@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-26 11:08:57.247828+00	2026-03-26 11:08:57.247879+00	2026-03-26 11:08:57.247879+00	2aa295f4-a548-43f5-b211-eb2ab85aede1
b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	{"sub": "b2f814fe-8a97-41c6-97ea-5dd4c594f2ae", "email": "admin@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-26 11:37:23.041506+00	2026-03-26 11:37:23.041561+00	2026-03-26 11:37:23.041561+00	5340d54a-5780-4a7a-a0aa-491bfa28fc71
98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	{"sub": "98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb", "email": "helpdesk@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-26 11:40:52.792237+00	2026-03-26 11:40:52.793183+00	2026-03-26 11:40:52.793183+00	782ab96a-2110-4bb8-a130-eacefff1cebc
4facc115-e468-4660-b440-2228132ab9d7	4facc115-e468-4660-b440-2228132ab9d7	{"sub": "4facc115-e468-4660-b440-2228132ab9d7", "email": "pharmacy@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-26 11:47:38.703303+00	2026-03-26 11:47:38.703354+00	2026-03-26 11:47:38.703354+00	677e36e6-497a-4be8-9919-1a748f4dce0d
cc0f9f24-5249-40be-9353-593d673e5cf5	cc0f9f24-5249-40be-9353-593d673e5cf5	{"sub": "cc0f9f24-5249-40be-9353-593d673e5cf5", "email": "abhishekgatty0@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-30 06:27:52.386018+00	2026-03-30 06:27:52.386069+00	2026-03-30 06:27:52.386069+00	652001e4-4384-408e-bfbb-dd5065d1e885
2893617e-1b73-4a19-9135-a0e7d1c34989	2893617e-1b73-4a19-9135-a0e7d1c34989	{"sub": "2893617e-1b73-4a19-9135-a0e7d1c34989", "email": "qaweby@forexzig.com", "email_verified": false, "phone_verified": false}	email	2026-03-30 06:41:14.237652+00	2026-03-30 06:41:14.237703+00	2026-03-30 06:41:14.237703+00	070a3290-d367-4660-af3d-417f846f4dfd
b3a610e3-6290-44b1-9801-dff381ec7fd6	b3a610e3-6290-44b1-9801-dff381ec7fd6	{"sub": "b3a610e3-6290-44b1-9801-dff381ec7fd6", "email": "deeraj@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-30 08:24:04.203892+00	2026-03-30 08:24:04.203947+00	2026-03-30 08:24:04.203947+00	e230af29-ee6a-45eb-8a50-17d1736e4ea5
bbeb504f-0b16-4524-9360-71ce9f055620	bbeb504f-0b16-4524-9360-71ce9f055620	{"sub": "bbeb504f-0b16-4524-9360-71ce9f055620", "email": "abhishekgatty21@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-30 08:46:53.151346+00	2026-03-30 08:46:53.151395+00	2026-03-30 08:46:53.151395+00	2e2c794c-c5d9-46a9-a70f-554aeb215704
a904610b-5ebe-4cce-b6c9-83002ca6e26b	a904610b-5ebe-4cce-b6c9-83002ca6e26b	{"sub": "a904610b-5ebe-4cce-b6c9-83002ca6e26b", "email": "dishanth@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-31 06:09:36.899816+00	2026-03-31 06:09:36.899874+00	2026-03-31 06:09:36.899874+00	57e5ee6f-98af-4d86-b4f1-aa8363a0360b
b7271c67-b547-4252-a4df-925b2cdcdebe	b7271c67-b547-4252-a4df-925b2cdcdebe	{"sub": "b7271c67-b547-4252-a4df-925b2cdcdebe", "email": "billing@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-04-02 11:39:18.446984+00	2026-04-02 11:39:18.447039+00	2026-04-02 11:39:18.447039+00	0b788a89-1445-4319-bd97-07d89a67a01d
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
7266bf27-c2e4-42ae-9f72-9eb56bdd553a	2026-03-26 09:06:48.943348+00	2026-03-26 09:06:48.943348+00	otp	6868aa4d-98d1-47e9-81d4-a1c72f40f55e
e0b692f7-50a5-4905-b404-4e84c4ee54ef	2026-03-26 09:24:17.796325+00	2026-03-26 09:24:17.796325+00	otp	14a80fe8-5239-4caf-974d-41616bac22f9
cfbd25f2-eed9-4495-946e-cba11946596d	2026-03-26 09:28:12.76186+00	2026-03-26 09:28:12.76186+00	password	ae1afac9-0351-46b6-b841-f9fbbeeef7d1
0a91b5e0-18e6-4193-bf87-f4f79328599d	2026-03-26 09:56:19.030183+00	2026-03-26 09:56:19.030183+00	password	e1092b35-ea2f-4a84-bc3d-e568da5d89a1
a0af65cf-ae9a-4308-9f47-9be2bb45d2fb	2026-03-26 10:17:15.375973+00	2026-03-26 10:17:15.375973+00	password	802b06e7-d564-4d1c-a47d-939806e66e09
0a3ebf09-f252-4dfc-b61b-1d2c75847358	2026-03-26 10:37:28.146488+00	2026-03-26 10:37:28.146488+00	password	5f6cb46f-5f33-4772-bdf3-16b7c0b43a3a
f6948a23-9a31-4127-9620-27e7bce8b3d0	2026-03-26 11:03:32.803584+00	2026-03-26 11:03:32.803584+00	password	8ba92f08-a198-435a-ac1b-82e21f0c4cb6
2501b1e5-39b6-44ba-9490-11772b9645c7	2026-03-26 11:09:22.805474+00	2026-03-26 11:09:22.805474+00	password	96c6368a-8f9a-4259-9ba4-721b8899b438
1fdb7fbc-d95d-4e4b-ac8f-edd93b41f64e	2026-03-26 11:39:23.197389+00	2026-03-26 11:39:23.197389+00	password	3a167c11-419f-42a8-a248-443ecc1bad6a
35235c4c-4ac7-4a46-b238-c852d0f239b4	2026-03-26 11:42:41.701715+00	2026-03-26 11:42:41.701715+00	password	82f1928a-1095-414c-a4ee-110d88af08a4
2e51fc3a-ed58-4d3d-a046-542ee256d43a	2026-03-26 11:44:57.155769+00	2026-03-26 11:44:57.155769+00	password	0d4467ac-a44a-442e-90fb-364b2999187f
36001dfa-861e-4231-9609-7a82747ab839	2026-03-26 11:49:55.157574+00	2026-03-26 11:49:55.157574+00	password	9cd58507-e1ed-46d4-adbb-9b23a39e8dae
2dc517a8-cfb1-460a-9e8e-c99bfe707818	2026-03-26 12:04:36.735957+00	2026-03-26 12:04:36.735957+00	password	e9030d14-ffc7-4e2b-b9d8-9d128885e4a0
b50627b0-7578-46a7-8ec3-1ff8bd786784	2026-03-26 12:05:51.847222+00	2026-03-26 12:05:51.847222+00	password	759170b7-19e1-4531-9bf0-1a59499e5d9f
0509ac5c-db98-4ae1-ab52-c138138c132a	2026-03-26 12:09:31.609037+00	2026-03-26 12:09:31.609037+00	password	c21ccddf-e6d3-4f5f-953f-b4e138c72005
6a2867ec-522f-4230-906b-9d131f23e0a1	2026-03-27 04:45:25.312552+00	2026-03-27 04:45:25.312552+00	password	57fb95cf-0f2a-49fd-ad69-ef1e4bf93378
0ae9efd0-ee97-4013-adf7-b1ef6a36260e	2026-03-27 04:46:38.790007+00	2026-03-27 04:46:38.790007+00	password	dda5fb14-6240-4d26-a226-5afd72e2ee9f
ec4135f6-dd11-4f05-9753-6b426262028a	2026-03-27 05:08:31.316803+00	2026-03-27 05:08:31.316803+00	password	0ae0c5f6-5c76-4897-822d-4bcf06460c3b
37253b71-5da2-4ddd-92bf-c39cba9edc37	2026-03-27 05:10:55.441688+00	2026-03-27 05:10:55.441688+00	password	462a6a23-77fe-47ae-b45c-0b48eb7b5843
3cfdc86f-2564-442d-a875-d174852e8b74	2026-03-27 05:12:06.406916+00	2026-03-27 05:12:06.406916+00	password	46cdb25d-87a5-4d56-8341-511c01a61625
bfc9ad67-8d61-4840-ab35-7fe1d21d003e	2026-03-27 06:18:08.491418+00	2026-03-27 06:18:08.491418+00	password	1044df16-226f-4e44-8f26-24dbcba736db
b8fd0c22-ddfd-4847-b6b4-ac53b9c96e0c	2026-03-27 06:26:18.945904+00	2026-03-27 06:26:18.945904+00	password	48ef69dd-7b67-4023-a179-61008da24ce5
063624cd-2d31-4cb1-8a8f-ddec6f8fa5c9	2026-03-27 06:26:46.938742+00	2026-03-27 06:26:46.938742+00	password	0e0d5741-7746-4665-94e4-d1e8dffd56eb
d045c5ad-173b-4697-8a7a-461692dcda28	2026-03-27 06:27:35.502309+00	2026-03-27 06:27:35.502309+00	password	d434c756-a600-48dc-b118-49685fb00f98
8e536c1d-cecf-4f17-9893-7b57f2d6bc49	2026-03-27 06:48:58.018254+00	2026-03-27 06:48:58.018254+00	password	8f1bd893-ebf6-4099-a44f-34a422dd7797
a3bd2908-b034-40e7-a362-3dc02148b2c9	2026-03-27 06:54:29.644427+00	2026-03-27 06:54:29.644427+00	password	593f618d-e62d-4e2e-990f-b5c9aacad7da
711a0ce7-cf8c-4ce9-b9fa-098d433e51d8	2026-03-27 06:55:11.848853+00	2026-03-27 06:55:11.848853+00	password	c8f46278-5244-4305-85e3-782a2b772e89
285f5c0f-f3a8-4d09-8686-137f4bc5777f	2026-03-27 07:29:44.954553+00	2026-03-27 07:29:44.954553+00	password	adfd9e3b-aa9f-4712-af99-383fb926d826
b968646c-c409-4a13-909d-4c8f2b6b25a1	2026-03-27 07:30:40.535609+00	2026-03-27 07:30:40.535609+00	password	01d3a815-0993-4f7f-a6ea-8378f300f132
58a683ff-15a0-4aaa-aeab-1b2b920a3821	2026-03-27 07:31:32.85898+00	2026-03-27 07:31:32.85898+00	password	f9fec45a-2adc-4250-9400-1d5c75d2ac90
74992612-bcfc-4e30-b71d-b0960a6b3650	2026-03-27 07:33:08.638013+00	2026-03-27 07:33:08.638013+00	password	4bb2f323-1a77-4b7a-93e6-e772561161fe
129d39c8-7cec-4e14-80fb-c2702cc82942	2026-03-27 07:37:31.002625+00	2026-03-27 07:37:31.002625+00	password	1fccb16c-b06d-4628-9687-e5b48365f37c
c9d792db-7285-4ffa-b6d2-bf11a25d88fe	2026-03-27 07:37:59.478935+00	2026-03-27 07:37:59.478935+00	password	88813eea-e307-4422-89b1-71c50a25a814
e957ad90-993e-4f83-93b5-895a25ae85b1	2026-03-27 07:41:52.148768+00	2026-03-27 07:41:52.148768+00	password	b41ab72b-0329-46f6-a780-79c435ba6e63
5694ec71-7ba3-4f26-845e-1b1619fac4e0	2026-03-27 07:45:30.176034+00	2026-03-27 07:45:30.176034+00	password	56e16cb0-89be-4c8f-8c59-b781215db18a
07cc8e6f-a572-426d-9baf-b9347ac3bba5	2026-03-27 07:49:05.944313+00	2026-03-27 07:49:05.944313+00	password	e2b023ea-8fae-4e5f-822f-0c4991e3d141
ff6a7256-52e1-4ccd-88c3-9c2c856850d1	2026-03-27 07:49:13.252721+00	2026-03-27 07:49:13.252721+00	password	8b10d482-66c0-4792-aca9-6a9efe5c4ee8
eff95a3a-ad5f-40bc-8656-ec008d4230e3	2026-03-27 07:49:38.812521+00	2026-03-27 07:49:38.812521+00	password	16df9ab1-c785-4b0d-a7c8-6d33d28b5656
beff3c5f-f481-4ba1-b326-f17b29738a07	2026-03-27 10:41:29.522583+00	2026-03-27 10:41:29.522583+00	password	2376da3b-b60e-4eb3-abe3-236e7342a4f1
eeeb3686-bb64-402d-9cc4-c0ad132ba0b1	2026-03-27 10:45:12.052583+00	2026-03-27 10:45:12.052583+00	password	ad06f402-039e-4c95-b7ba-a8ca3b91f88e
b2bedb96-9fe3-4012-9c68-e96b8a5bd093	2026-03-27 10:46:07.129605+00	2026-03-27 10:46:07.129605+00	password	5bae5061-724e-4a9d-b954-ec2666d40b06
f0a27365-9783-42cd-9aa4-3e22a7aa0394	2026-03-27 10:47:12.878546+00	2026-03-27 10:47:12.878546+00	password	b3db24d9-6dee-468d-80de-4ca31bcb7f68
260c5753-a9e1-4a3c-bcad-d3b7ddecec37	2026-03-27 11:08:04.10731+00	2026-03-27 11:08:04.10731+00	password	a6375b6e-7320-402f-9ab2-cb861cd14686
1ea9bcda-d193-46c9-a6be-babfa55c66f7	2026-03-27 11:50:21.79838+00	2026-03-27 11:50:21.79838+00	password	6ab0abd6-681f-40bc-940e-36e9db21f1c7
5a15bbbf-2293-496d-a161-af51ab378a3c	2026-03-27 11:50:56.018958+00	2026-03-27 11:50:56.018958+00	password	264a6ce6-b2f8-4f30-9fac-7aa7a893631f
b962772a-c49f-407c-93b2-f1df73bdb703	2026-03-27 11:54:29.727568+00	2026-03-27 11:54:29.727568+00	password	2c431412-6ecc-4037-8d91-65ae275bf9f3
88a6b041-2710-46fd-80a8-7aec4ca256e2	2026-03-27 12:14:52.811784+00	2026-03-27 12:14:52.811784+00	password	d195c16a-0710-4f7d-a046-53691b391a07
828cb6d6-e265-48f4-966e-8108108ff31e	2026-03-27 12:16:32.533889+00	2026-03-27 12:16:32.533889+00	password	ea84106d-7a62-49a3-a2bf-e291a6c98b7b
5799f0db-4910-477c-b2b9-cb3787df542a	2026-03-27 12:16:55.902921+00	2026-03-27 12:16:55.902921+00	password	0c5771cc-dd97-4029-a82d-196e5c7699a5
602a2e0d-2f63-4a8d-9ebd-5b9be5dcd500	2026-03-27 12:18:15.606541+00	2026-03-27 12:18:15.606541+00	password	e34d4a3c-9f4b-46c7-ae30-b777d3e274b5
473cc46c-901b-4d49-a145-0febe23226c9	2026-03-27 12:29:26.361961+00	2026-03-27 12:29:26.361961+00	password	fd2dc38e-e7a2-448e-82b4-2f1f8ef9a036
29021b23-009b-4fb1-a8ed-cdfddf342a7d	2026-03-27 12:39:33.073702+00	2026-03-27 12:39:33.073702+00	password	20283950-46e8-4623-96ad-965bf742c2b3
5651804c-c1b2-484f-8aa5-97f5618823f8	2026-03-27 12:45:32.853298+00	2026-03-27 12:45:32.853298+00	password	5ab91400-59c9-4f39-88cc-0082aff8d1d1
122a1c74-b34c-463d-9402-33eec0658e1b	2026-03-27 12:47:53.554441+00	2026-03-27 12:47:53.554441+00	password	c3113d44-5ee8-445e-8e4b-bd12eff27036
1c07d599-6169-427e-9c68-05103d60e12d	2026-03-27 12:48:52.677651+00	2026-03-27 12:48:52.677651+00	password	0aa0949e-7e93-44b5-a058-6818d7bfd26e
afc50ecc-32d4-4efd-b3ac-e16f5d59127a	2026-03-27 12:51:29.6776+00	2026-03-27 12:51:29.6776+00	password	5eb3b19b-9419-44f6-8137-0abeb5e80ff4
d7f87781-fda4-4444-8f1e-4a068d072c26	2026-03-28 05:27:34.107933+00	2026-03-28 05:27:34.107933+00	password	1b2f566a-e9dc-452e-9175-3aa98c907e66
188d4b0e-c1dc-4516-acc6-ea30afd1ab85	2026-03-28 06:02:50.890631+00	2026-03-28 06:02:50.890631+00	password	6063fd40-cdc0-4400-a06f-f0311e4ffe62
82aba822-3b5e-4e69-bcb5-cb5c591db2fb	2026-03-28 11:34:13.13757+00	2026-03-28 11:34:13.13757+00	password	424fbafe-573e-44da-8bc9-af208efa82c6
905350a2-995e-4c76-bb3c-4ec18d3f1d13	2026-03-30 04:45:06.958965+00	2026-03-30 04:45:06.958965+00	password	65f6439c-a47a-4cee-acaa-19636fcceae8
cb9e75e7-9f14-43dd-b519-dfe2435425c7	2026-03-30 04:53:49.404927+00	2026-03-30 04:53:49.404927+00	password	56f94348-fed3-42c1-a0f6-b276c4534003
ff52101a-e40e-4cb7-9385-88455c1465ba	2026-03-30 05:04:32.227859+00	2026-03-30 05:04:32.227859+00	password	0849474f-9db9-4478-ac90-880c611edcdd
ccb13c8d-9a87-40b8-b221-68cff5753768	2026-03-30 09:18:10.417318+00	2026-03-30 09:18:10.417318+00	password	ca8bbc02-72c8-4754-a401-2d10656a95cd
86cf510b-0a48-4674-bd65-114ff43dcf92	2026-03-30 09:19:27.323951+00	2026-03-30 09:19:27.323951+00	password	3f7b9f7f-793a-456a-abdc-500c3a564be6
ce262467-24c7-499d-8ac6-da3a25e906f4	2026-03-30 09:30:46.031514+00	2026-03-30 09:30:46.031514+00	password	436e759d-634b-4670-8000-42f921c5c987
b87657e6-ef82-4478-91a8-d714ec1b6744	2026-03-30 09:31:24.455508+00	2026-03-30 09:31:24.455508+00	password	cf79b4f0-e6ec-44f5-8ee0-1357dd0e52ea
f86cba51-11c0-444f-854a-eb9d8d215967	2026-03-30 09:32:37.883084+00	2026-03-30 09:32:37.883084+00	password	15b81abd-f5de-4570-9973-d9a23f04415d
a4896750-3e6a-4d2a-bec6-f0b4762fcf00	2026-03-30 11:36:53.281544+00	2026-03-30 11:36:53.281544+00	password	3cb9ee13-3f86-43a5-af80-6f28308346b3
c84d7d0b-61de-46ef-aa56-77afac50dbc2	2026-03-30 11:44:16.980774+00	2026-03-30 11:44:16.980774+00	password	8f88afe3-e278-4141-af0a-fac041dd34b1
2080a195-ba47-4612-8942-d8e69d118694	2026-03-30 11:47:03.27846+00	2026-03-30 11:47:03.27846+00	password	2baadd96-6ef5-4e8a-8e7f-87e617ec6249
faebe441-f32d-47c6-b81f-5143f899b1df	2026-03-30 11:54:15.937948+00	2026-03-30 11:54:15.937948+00	password	c2dd082d-1668-44a9-875e-0e6a43c8b2a4
e01c7d20-2eb0-4c59-8bd2-b718dbb79435	2026-03-30 11:56:27.740636+00	2026-03-30 11:56:27.740636+00	password	939ae380-03df-4229-b8a9-b17dec3f4eb6
23ef0a5e-6fc2-4c03-97f3-ec028fb50b34	2026-03-30 11:59:16.46447+00	2026-03-30 11:59:16.46447+00	password	a509aba3-4108-4007-b8a4-c094b164bab7
2d1ac820-6f10-4e7d-a13c-624696157cab	2026-03-30 12:02:47.168843+00	2026-03-30 12:02:47.168843+00	password	db395b2b-4428-4c16-8776-cc8e981cfd58
cdfeda14-feeb-4975-b1a4-474e91551186	2026-03-30 12:03:20.045404+00	2026-03-30 12:03:20.045404+00	password	d7c8fdaa-4df7-4ac0-a1e0-43119529aae3
714702ec-a70d-4809-826c-4476d5503478	2026-03-30 12:20:54.688161+00	2026-03-30 12:20:54.688161+00	password	14d3cd8e-74d0-4a56-bfa0-e81884846eaa
e2d0e919-8381-4327-aa0d-4c6602a8d930	2026-03-30 12:21:32.573238+00	2026-03-30 12:21:32.573238+00	password	cda0582e-afcf-4ded-b7f9-faf45977048c
cf4e34c1-a692-4846-803c-54efbea8fbb0	2026-03-30 12:31:11.230325+00	2026-03-30 12:31:11.230325+00	password	6b512e2c-735b-4d9b-9dd1-0718b4f512a8
aeff1c80-45fb-47aa-9398-226df10a711a	2026-03-31 06:11:24.742154+00	2026-03-31 06:11:24.742154+00	password	53cb0897-16af-44f5-9dcd-2748b62b7bc3
54b170ae-bc29-4667-ab92-599295f814a5	2026-03-31 06:15:03.400477+00	2026-03-31 06:15:03.400477+00	password	d25851fc-231d-482a-836e-9f026cea4f9c
06805cd3-cce3-4391-a2c8-921013f8bb4a	2026-03-31 06:15:43.422481+00	2026-03-31 06:15:43.422481+00	password	4db09909-16a5-4d4a-ad00-be685a85d071
a4129b7d-2939-43be-9566-bc38cd4544ff	2026-03-31 06:16:09.026758+00	2026-03-31 06:16:09.026758+00	password	509232ff-75b8-4be7-a402-31fafdb73bbe
b3669d3a-6380-4487-93f1-442bedf211aa	2026-03-31 06:17:06.684142+00	2026-03-31 06:17:06.684142+00	password	0c67b4f3-095b-4c56-aa05-50921fc3d2d6
0bcce1fb-90d0-4612-b68d-7204e9419107	2026-03-31 08:16:40.374184+00	2026-03-31 08:16:40.374184+00	password	f6019b83-d8f4-4d7e-9a68-a3217e58b510
9e5d198c-abe7-4707-9b43-f873bc904c51	2026-03-31 10:39:12.167091+00	2026-03-31 10:39:12.167091+00	password	2ef87ddc-67b5-497f-bb76-fa22b98713f4
5d7008f2-5a47-4e1d-89fd-bb23e356dacf	2026-03-31 10:41:24.104458+00	2026-03-31 10:41:24.104458+00	password	1f9f26e5-9957-410c-aa50-933511e29962
4cdf4ede-6d2c-4026-8e44-3cea4ef464e3	2026-03-31 10:42:41.85455+00	2026-03-31 10:42:41.85455+00	password	34b5a018-c505-4ce3-9e34-30d96b6213a1
f007267f-df66-4073-b305-231c460be44b	2026-03-31 10:46:23.521731+00	2026-03-31 10:46:23.521731+00	password	129d8a39-5d41-4385-b9a3-85cfa362af43
721193d4-6841-44d1-9c6e-5d4ffd1b73b3	2026-03-31 10:54:08.409655+00	2026-03-31 10:54:08.409655+00	password	9a0af6d9-b57a-4e99-8014-21d2cb057d63
08349095-c457-4849-96c1-6e0c1280eac1	2026-03-31 11:28:08.287112+00	2026-03-31 11:28:08.287112+00	password	10b5590a-6dc4-4cd5-b119-acc2e76d4024
8a9c23a6-11eb-4bc9-a748-5c76101ef4de	2026-03-31 11:33:00.68494+00	2026-03-31 11:33:00.68494+00	password	4cf5237a-ed9f-45cf-bef3-ceddd852bbb9
1895f912-6cac-443c-a7be-2ec33c2eaab7	2026-03-31 11:36:36.368757+00	2026-03-31 11:36:36.368757+00	password	0c56022a-9625-4d93-ae24-59fe3130028c
7cb56bda-f645-465b-ba2c-2dc973d87abb	2026-03-31 11:40:47.115043+00	2026-03-31 11:40:47.115043+00	password	b89d33d5-5104-46fe-a39f-695c1fc7a9b8
4e1c318e-f3b7-4daa-bab6-d088bb55649a	2026-03-31 11:41:12.120839+00	2026-03-31 11:41:12.120839+00	password	1ca1de41-8133-4c49-b2cf-a89f5b1e1221
4b52b854-5579-47c8-871e-bb5b0a50cae9	2026-03-31 11:56:01.199134+00	2026-03-31 11:56:01.199134+00	password	66e2e2f8-d023-4302-8a09-60bd355f6f90
76c0f0d6-1f60-4e80-b263-482898874c18	2026-04-01 05:06:34.186262+00	2026-04-01 05:06:34.186262+00	password	eef7460a-3daf-4cb4-9d7a-60400b64ae63
8c0d83dc-9259-42ef-a11a-4a763549c0d8	2026-04-02 11:41:41.498591+00	2026-04-02 11:41:41.498591+00	password	7086a247-51ae-43eb-bc0c-ea6a6722f484
4cfd132d-d2c4-4362-a7af-cddf20935b6d	2026-04-02 11:44:08.067484+00	2026-04-02 11:44:08.067484+00	password	51ffc35e-50bc-461c-9b58-1f6724e50fdb
f3c2a237-09fe-45bc-a326-490b935ce4d3	2026-04-02 11:50:34.612102+00	2026-04-02 11:50:34.612102+00	password	8870ce77-6119-4e61-9e44-f35e9b038921
07c5f6c5-0cd1-4116-8423-7e1f797d2998	2026-04-02 12:05:55.334426+00	2026-04-02 12:05:55.334426+00	password	df9d01f5-027e-4e84-8cad-785df63e01df
c9b4ad0f-ee5f-4c39-a7bb-fd5ddbc310cb	2026-04-02 12:06:29.522528+00	2026-04-02 12:06:29.522528+00	password	f6c53208-1df2-4d43-b8f9-e5361848a96c
635c96d5-16f0-422c-9120-c309861d1dab	2026-04-02 12:06:38.495459+00	2026-04-02 12:06:38.495459+00	password	2fa4261c-d632-498c-870e-9aba68fabc2d
6db7ee20-69ce-424b-a942-932e36bd4672	2026-04-02 12:08:01.953772+00	2026-04-02 12:08:01.953772+00	password	ceaa294c-3a05-4f75-81b1-642aa6c243da
ed71c346-7a70-4a14-ba36-af2c675f6af4	2026-04-02 12:08:42.816211+00	2026-04-02 12:08:42.816211+00	password	f04ccfd2-539d-4278-a928-ce9de5986f71
11a095fb-7039-4ace-8bc1-7bd7c0d8af91	2026-04-02 13:24:08.961241+00	2026-04-02 13:24:08.961241+00	password	57d6fe4e-07a2-41f5-a342-dba5e27b7f2a
743f84a1-0998-4cc8-8f7c-0eebc03c1c0a	2026-04-02 13:28:52.881735+00	2026-04-02 13:28:52.881735+00	password	38123bf9-020b-4c5f-ad6c-443356a2d25c
e92c1c17-f2fb-407d-a80c-640afc77f5a5	2026-04-02 13:46:22.410813+00	2026-04-02 13:46:22.410813+00	password	6f2cdfe2-1933-4c82-a03f-a86e12d92d80
8d117774-5aca-4e56-8019-4a2174f204f8	2026-04-02 13:47:44.431526+00	2026-04-02 13:47:44.431526+00	password	5d3252d8-6b7a-40e2-a5ef-a95749eadfaf
fa2580eb-6ae8-4487-832f-b76fb377e958	2026-04-03 04:57:11.305884+00	2026-04-03 04:57:11.305884+00	password	787842b9-4e0f-49e0-a658-cff91fc885c7
490afe5a-c0a0-4722-932f-46df7f2d72ce	2026-04-03 05:07:52.79984+00	2026-04-03 05:07:52.79984+00	password	c0629d2a-2527-4aa6-b9c8-29527eb06a5d
b3f02c90-8483-44d8-bb08-655591bdbf16	2026-04-03 05:08:51.460599+00	2026-04-03 05:08:51.460599+00	password	495914c7-96b3-4a56-9e33-15bf3ece10f8
59cfa726-8cc8-4f00-8b23-39b1bb7060ef	2026-04-03 05:28:18.726744+00	2026-04-03 05:28:18.726744+00	password	4fb68e68-88e3-4acc-b530-5ea97eb5584a
35f8f65a-16fc-4ef7-8fee-f410dc4d6ca2	2026-04-03 05:39:35.731971+00	2026-04-03 05:39:35.731971+00	password	79604bf6-56e4-436e-a479-276c5c949dcd
d661f81c-6fe8-41ed-ac00-7cd04368be1d	2026-04-03 09:50:50.302696+00	2026-04-03 09:50:50.302696+00	password	f85a2ff6-3ee1-466e-9f17-491006b4b095
ea4eb1ef-26c1-476e-8a1b-7f5f229292f5	2026-04-03 10:28:07.145523+00	2026-04-03 10:28:07.145523+00	password	9584509a-bcb1-4f77-8413-b45f490cc1b8
c86e399b-910a-47f2-9e57-690b5147795b	2026-04-03 10:32:51.363041+00	2026-04-03 10:32:51.363041+00	password	e0b71e56-288d-4694-be38-38d7f5e017ec
56a2da5f-6659-4bec-94b4-78218a851724	2026-04-03 10:34:43.031295+00	2026-04-03 10:34:43.031295+00	password	365b4ea6-b5d8-4c7d-8b43-35679fc68798
85148157-35c7-4d35-895a-51fcc087166c	2026-04-03 10:35:20.396951+00	2026-04-03 10:35:20.396951+00	password	125693b7-2c04-41ed-adb5-66e3649a035f
d5c9b095-7f28-4e5d-8823-e4a9e0d29b0f	2026-04-06 04:20:45.100729+00	2026-04-06 04:20:45.100729+00	password	6aaacdff-f779-4634-9d21-afc0241200b5
c7556287-e596-4d0d-b4b6-08e1d7d5ea50	2026-04-06 04:47:12.440748+00	2026-04-06 04:47:12.440748+00	password	ab5f91d7-5704-4886-9e42-876691caad58
2f93e346-d8b0-40a5-a153-7681276c47bd	2026-04-06 05:39:36.514538+00	2026-04-06 05:39:36.514538+00	password	ed3023ab-6beb-49e2-a9c0-4dbffd1ce153
90fd47b6-0e1d-4343-83f1-8c21ca2d5c26	2026-04-06 06:09:28.463844+00	2026-04-06 06:09:28.463844+00	password	03e68606-185c-4110-b8b4-2623a37dd116
caea5e55-ec23-4520-9997-16b057ea90a3	2026-04-06 06:25:45.86896+00	2026-04-06 06:25:45.86896+00	password	8acfd3c3-7ca5-47ee-9a48-1e2e5cd850b1
d1b72642-b7f9-418a-bccd-04bea79c212e	2026-04-06 06:32:01.618515+00	2026-04-06 06:32:01.618515+00	password	e31ac4b4-4470-4b02-8b94-f31993fe7128
b8d6e757-0a6d-4bd0-88e7-cab95e8e6d4a	2026-04-06 06:38:46.010035+00	2026-04-06 06:38:46.010035+00	password	ce9114ca-e406-4144-abc9-a6a72a88fd3e
ef0a0428-d868-43c7-b18b-5d6f04b1cb4c	2026-04-06 06:40:19.612187+00	2026-04-06 06:40:19.612187+00	password	4b4d5a98-f964-4acb-bd68-f7cf0d6f448a
c6b552bd-7114-4150-bd81-ed5a6c19700b	2026-04-06 11:41:27.322536+00	2026-04-06 11:41:27.322536+00	password	c4d3adf3-f737-4de6-93c4-7b92ea205fb2
dd93361a-cbb1-41e3-92b1-64d44b3e634b	2026-04-06 12:01:48.031114+00	2026-04-06 12:01:48.031114+00	password	1976dff7-2342-40e4-a501-92d7b00e0f4b
7229a461-997c-4d20-8651-2d9a45cb0642	2026-04-07 05:44:26.418104+00	2026-04-07 05:44:26.418104+00	password	723032a2-1873-4c18-8903-b9fa5f5807e1
6e8f6a87-87ff-42d0-bd74-0b363aaf3f02	2026-04-07 05:48:53.011499+00	2026-04-07 05:48:53.011499+00	password	cd3ba3e0-7579-49f9-8682-874b6cf45cb2
c038385c-078a-4c6e-9090-451edaee8dae	2026-04-07 07:23:32.822474+00	2026-04-07 07:23:32.822474+00	password	0ebb352d-e49e-4470-9422-de3d091c3dba
9afcad15-1003-4bb2-a172-295b7c76f597	2026-04-07 09:06:04.248326+00	2026-04-07 09:06:04.248326+00	password	ab103ac2-7e40-4cb4-b280-6d0582e30aab
904b4d5f-df5a-4857-8d02-b4cb59eef77d	2026-04-07 09:44:39.142017+00	2026-04-07 09:44:39.142017+00	password	71554884-b389-41dd-b71c-24718e10a514
7aa55054-b0d7-42e1-ba12-b23da61efa8e	2026-04-07 13:06:11.306819+00	2026-04-07 13:06:11.306819+00	password	62951767-13ea-45b9-a91a-038c085e9ba6
24a8b029-aba0-4821-aa12-226436108f87	2026-04-08 06:27:45.725949+00	2026-04-08 06:27:45.725949+00	password	0c44031b-5bf5-4236-8fb2-85791743b984
3d7da303-9810-450b-aa50-4357696d2a6b	2026-04-08 09:00:48.814814+00	2026-04-08 09:00:48.814814+00	password	4bc4ef3f-d270-40e8-b47a-04392e83fb74
7a27a9d2-3669-4536-acec-084edf669da5	2026-04-08 09:01:51.884826+00	2026-04-08 09:01:51.884826+00	password	8f98d31a-4e34-4548-8b27-7ae575290890
f7538dc9-96fc-428f-9405-061cf5f3fd25	2026-04-08 09:03:11.877506+00	2026-04-08 09:03:11.877506+00	password	7cfeb5dd-66dc-47ce-8093-07e8aedcfabf
1fbfd54b-1601-4de6-8105-0dc66b51cbbf	2026-04-08 09:04:50.66244+00	2026-04-08 09:04:50.66244+00	password	68ab016c-5b17-482e-bcb6-73ee6e4158f9
83268703-7c40-4107-82a7-a967c7526c9e	2026-04-08 09:44:10.432001+00	2026-04-08 09:44:10.432001+00	password	976170ba-7f04-43fd-8f61-82aa427eba2b
70d99088-f7c1-446a-a2ba-f79fc26f9504	2026-04-09 06:33:06.337372+00	2026-04-09 06:33:06.337372+00	password	d7c2e0bf-6348-4bc7-99f7-482f1a87e631
a292dbe8-92fe-4ded-85a3-f80d8ebf65cd	2026-04-09 09:25:49.862976+00	2026-04-09 09:25:49.862976+00	password	87233f5c-210b-45c2-ba28-c3dfa9b4e699
302811d2-e583-4915-84e4-d83ac6720615	2026-04-09 12:10:44.153942+00	2026-04-09 12:10:44.153942+00	password	f8d8cf4a-28e2-4266-92c5-5526a44e8c8b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
d4549220-0d45-4938-a8eb-f8b3ce8a7180	cc0f9f24-5249-40be-9353-593d673e5cf5	confirmation_token	fc06d31885e3933fbd0192f2c57daea305ab745439db79d5b494a024	abhishekgatty0@gmail.com	2026-03-30 06:27:54.78508	2026-03-30 06:27:54.78508
1931ba6a-3afc-4fa9-b555-f4ccb42ad60f	2893617e-1b73-4a19-9135-a0e7d1c34989	confirmation_token	b7f993952547cec40f31f1203b4a3813133ae2b1fc2719353cb585ea	qaweby@forexzig.com	2026-03-30 06:49:23.542774	2026-03-30 06:49:23.542774
d452d8a4-783a-4856-acb3-6217962b3914	b3a610e3-6290-44b1-9801-dff381ec7fd6	confirmation_token	68b24a600cf7baae63a58efdefd7d57b7ba690ac05d5243d946f8a5f	deeraj@gmail.com	2026-03-30 08:24:07.048113	2026-03-30 08:24:07.048113
a949ee18-5e25-46a4-8e25-10f76b083d69	bbeb504f-0b16-4524-9360-71ce9f055620	confirmation_token	8fc3e7581760a1c0f824336095844f663a2da0789fe4ec756421c2b2	abhishekgatty21@gmail.com	2026-03-30 08:46:55.941426	2026-03-30 08:46:55.941426
0975a058-2947-4432-832d-b0d782911f45	a904610b-5ebe-4cce-b6c9-83002ca6e26b	confirmation_token	8be9603589d83012e9bfd7154548837a7581a849f5a13e6e03fcd94d	dishanth@gmail.com	2026-03-31 06:09:39.730127	2026-03-31 06:09:39.730127
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	66ydwdjfmr55	572d0b22-e590-4dd6-a64b-19e9a3dbd048	f	2026-03-26 09:06:48.932469+00	2026-03-26 09:06:48.932469+00	\N	7266bf27-c2e4-42ae-9f72-9eb56bdd553a
00000000-0000-0000-0000-000000000000	214	e542t27supm5	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-07 08:43:32.723949+00	2026-04-07 08:43:32.723949+00	htw2mss4jdj4	6e8f6a87-87ff-42d0-bd74-0b363aaf3f02
00000000-0000-0000-0000-000000000000	3	6trbjfb3ez2m	941d29b5-c66f-4f5e-bc75-a1da83842e5b	f	2026-03-26 09:28:12.753521+00	2026-03-26 09:28:12.753521+00	\N	cfbd25f2-eed9-4495-946e-cba11946596d
00000000-0000-0000-0000-000000000000	4	fg455mjlkezu	941d29b5-c66f-4f5e-bc75-a1da83842e5b	f	2026-03-26 09:56:18.997017+00	2026-03-26 09:56:18.997017+00	\N	0a91b5e0-18e6-4193-bf87-f4f79328599d
00000000-0000-0000-0000-000000000000	5	24z7wrglpngj	941d29b5-c66f-4f5e-bc75-a1da83842e5b	f	2026-03-26 10:17:15.356883+00	2026-03-26 10:17:15.356883+00	\N	a0af65cf-ae9a-4308-9f47-9be2bb45d2fb
00000000-0000-0000-0000-000000000000	6	nlq2sdfsra5g	941d29b5-c66f-4f5e-bc75-a1da83842e5b	f	2026-03-26 10:37:28.125526+00	2026-03-26 10:37:28.125526+00	\N	0a3ebf09-f252-4dfc-b61b-1d2c75847358
00000000-0000-0000-0000-000000000000	7	6wama3xrzw7v	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-26 11:03:32.789705+00	2026-03-26 11:03:32.789705+00	\N	f6948a23-9a31-4127-9620-27e7bce8b3d0
00000000-0000-0000-0000-000000000000	8	mohbyvlj7gnl	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-26 11:09:22.78347+00	2026-03-26 11:09:22.78347+00	\N	2501b1e5-39b6-44ba-9490-11772b9645c7
00000000-0000-0000-0000-000000000000	9	gaova2dws5ra	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-26 11:39:23.182946+00	2026-03-26 11:39:23.182946+00	\N	1fdb7fbc-d95d-4e4b-ac8f-edd93b41f64e
00000000-0000-0000-0000-000000000000	10	n3xli72gjce5	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-26 11:42:41.687848+00	2026-03-26 11:42:41.687848+00	\N	35235c4c-4ac7-4a46-b238-c852d0f239b4
00000000-0000-0000-0000-000000000000	11	yazrkvy3syg6	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-26 11:44:57.138332+00	2026-03-26 11:44:57.138332+00	\N	2e51fc3a-ed58-4d3d-a046-542ee256d43a
00000000-0000-0000-0000-000000000000	12	7dg3ynwwjoj7	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-26 11:49:55.146564+00	2026-03-26 11:49:55.146564+00	\N	36001dfa-861e-4231-9609-7a82747ab839
00000000-0000-0000-0000-000000000000	2	pepo7oegxoeh	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-26 09:24:17.780889+00	2026-03-26 12:04:24.440683+00	\N	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	14	buj5xn7gawyc	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-26 12:04:36.733616+00	2026-03-26 12:04:36.733616+00	\N	2dc517a8-cfb1-460a-9e8e-c99bfe707818
00000000-0000-0000-0000-000000000000	15	lnpmzhjs2jwp	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-26 12:05:51.843062+00	2026-03-26 12:05:51.843062+00	\N	b50627b0-7578-46a7-8ec3-1ff8bd786784
00000000-0000-0000-0000-000000000000	16	4xeovzzmobxd	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-26 12:09:31.60025+00	2026-03-26 12:09:31.60025+00	\N	0509ac5c-db98-4ae1-ab52-c138138c132a
00000000-0000-0000-0000-000000000000	13	zyrhfzlblzpv	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-26 12:04:24.46259+00	2026-03-27 04:45:04.397739+00	pepo7oegxoeh	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	18	odegyjrtbnyo	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-27 04:45:25.30637+00	2026-03-27 04:45:25.30637+00	\N	6a2867ec-522f-4230-906b-9d131f23e0a1
00000000-0000-0000-0000-000000000000	19	2y6o3y4smayn	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-27 04:46:38.767527+00	2026-03-27 04:46:38.767527+00	\N	0ae9efd0-ee97-4013-adf7-b1ef6a36260e
00000000-0000-0000-0000-000000000000	20	wb6acw4ld3dq	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 05:08:31.274075+00	2026-03-27 05:08:31.274075+00	\N	ec4135f6-dd11-4f05-9753-6b426262028a
00000000-0000-0000-0000-000000000000	21	ztun5aahvzmp	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 05:10:55.430817+00	2026-03-27 05:10:55.430817+00	\N	37253b71-5da2-4ddd-92bf-c39cba9edc37
00000000-0000-0000-0000-000000000000	22	ystqyivthgkn	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-27 05:12:06.376404+00	2026-03-27 06:10:25.868695+00	\N	3cfdc86f-2564-442d-a875-d174852e8b74
00000000-0000-0000-0000-000000000000	23	qgtoeppfrpyp	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 06:10:25.883396+00	2026-03-27 06:10:25.883396+00	ystqyivthgkn	3cfdc86f-2564-442d-a875-d174852e8b74
00000000-0000-0000-0000-000000000000	17	b3t3uvegjhr6	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-27 04:45:04.418805+00	2026-03-27 06:17:45.014699+00	zyrhfzlblzpv	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	25	lnlmjwom5jkh	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 06:18:08.485246+00	2026-03-27 06:18:08.485246+00	\N	bfc9ad67-8d61-4840-ab35-7fe1d21d003e
00000000-0000-0000-0000-000000000000	26	i57oefxvkvzp	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 06:26:18.934328+00	2026-03-27 06:26:18.934328+00	\N	b8fd0c22-ddfd-4847-b6b4-ac53b9c96e0c
00000000-0000-0000-0000-000000000000	27	3itwbcqm3bin	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 06:26:46.932531+00	2026-03-27 06:26:46.932531+00	\N	063624cd-2d31-4cb1-8a8f-ddec6f8fa5c9
00000000-0000-0000-0000-000000000000	28	7zkhiktftvq5	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 06:27:35.497975+00	2026-03-27 06:27:35.497975+00	\N	d045c5ad-173b-4697-8a7a-461692dcda28
00000000-0000-0000-0000-000000000000	29	vzjspsboulgm	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 06:48:58.001512+00	2026-03-27 06:48:58.001512+00	\N	8e536c1d-cecf-4f17-9893-7b57f2d6bc49
00000000-0000-0000-0000-000000000000	31	m56pkbddmrqm	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 06:55:11.822324+00	2026-03-27 06:55:11.822324+00	\N	711a0ce7-cf8c-4ce9-b9fa-098d433e51d8
00000000-0000-0000-0000-000000000000	24	2ijxt6r2e7ez	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-27 06:17:45.020544+00	2026-03-27 07:22:15.150296+00	b3t3uvegjhr6	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	33	6drrhmcc2puv	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 07:29:44.934362+00	2026-03-27 07:29:44.934362+00	\N	285f5c0f-f3a8-4d09-8686-137f4bc5777f
00000000-0000-0000-0000-000000000000	34	4dywnetrduxy	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 07:30:40.510309+00	2026-03-27 07:30:40.510309+00	\N	b968646c-c409-4a13-909d-4c8f2b6b25a1
00000000-0000-0000-0000-000000000000	35	vogtr5ubf4gu	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-27 07:31:32.857046+00	2026-03-27 07:31:32.857046+00	\N	58a683ff-15a0-4aaa-aeab-1b2b920a3821
00000000-0000-0000-0000-000000000000	36	j757aug6w5s6	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 07:33:08.606874+00	2026-03-27 07:33:08.606874+00	\N	74992612-bcfc-4e30-b71d-b0960a6b3650
00000000-0000-0000-0000-000000000000	37	qlgsjcqzm5vv	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 07:37:30.993852+00	2026-03-27 07:37:30.993852+00	\N	129d39c8-7cec-4e14-80fb-c2702cc82942
00000000-0000-0000-0000-000000000000	38	eb6hd2o6kn4t	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 07:37:59.465522+00	2026-03-27 07:37:59.465522+00	\N	c9d792db-7285-4ffa-b6d2-bf11a25d88fe
00000000-0000-0000-0000-000000000000	39	x7esrnqq2h42	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-27 07:41:52.127758+00	2026-03-27 07:41:52.127758+00	\N	e957ad90-993e-4f83-93b5-895a25ae85b1
00000000-0000-0000-0000-000000000000	40	44ndeuinabhb	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-27 07:45:30.161493+00	2026-03-27 07:45:30.161493+00	\N	5694ec71-7ba3-4f26-845e-1b1619fac4e0
00000000-0000-0000-0000-000000000000	41	sy5nsreub6xe	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 07:49:05.931697+00	2026-03-27 07:49:05.931697+00	\N	07cc8e6f-a572-426d-9baf-b9347ac3bba5
00000000-0000-0000-0000-000000000000	42	c5imsqgsemql	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 07:49:13.243834+00	2026-03-27 07:49:13.243834+00	\N	ff6a7256-52e1-4ccd-88c3-9c2c856850d1
00000000-0000-0000-0000-000000000000	43	uyb43szmeokq	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 07:49:38.805553+00	2026-03-27 07:49:38.805553+00	\N	eff95a3a-ad5f-40bc-8656-ec008d4230e3
00000000-0000-0000-0000-000000000000	30	yrhc3k5qnlsq	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-27 06:54:29.609941+00	2026-03-27 07:58:08.527844+00	\N	a3bd2908-b034-40e7-a362-3dc02148b2c9
00000000-0000-0000-0000-000000000000	44	r3cpr7osocek	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-27 07:58:08.547911+00	2026-03-27 10:11:24.002807+00	yrhc3k5qnlsq	a3bd2908-b034-40e7-a362-3dc02148b2c9
00000000-0000-0000-0000-000000000000	45	hzx2lqknbirm	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 10:11:24.019635+00	2026-03-27 10:11:24.019635+00	r3cpr7osocek	a3bd2908-b034-40e7-a362-3dc02148b2c9
00000000-0000-0000-0000-000000000000	32	trheiana3xo3	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-27 07:22:15.163448+00	2026-03-27 10:40:35.308825+00	2ijxt6r2e7ez	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	47	bc36oh6xyote	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 10:41:29.512292+00	2026-03-27 10:41:29.512292+00	\N	beff3c5f-f481-4ba1-b326-f17b29738a07
00000000-0000-0000-0000-000000000000	48	ahqsj62kmyxo	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-27 10:45:12.025228+00	2026-03-27 10:45:12.025228+00	\N	eeeb3686-bb64-402d-9cc4-c0ad132ba0b1
00000000-0000-0000-0000-000000000000	50	2vfxzmwucybe	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-27 10:47:12.865926+00	2026-03-27 10:47:12.865926+00	\N	f0a27365-9783-42cd-9aa4-3e22a7aa0394
00000000-0000-0000-0000-000000000000	51	4ewiueudka5a	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 11:08:04.096101+00	2026-03-27 11:08:04.096101+00	\N	260c5753-a9e1-4a3c-bcad-d3b7ddecec37
00000000-0000-0000-0000-000000000000	49	sitoziq53rzu	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	t	2026-03-27 10:46:07.115304+00	2026-03-27 11:44:32.459169+00	\N	b2bedb96-9fe3-4012-9c68-e96b8a5bd093
00000000-0000-0000-0000-000000000000	52	mpfz4fmd6wpc	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 11:44:32.484215+00	2026-03-27 11:44:32.484215+00	sitoziq53rzu	b2bedb96-9fe3-4012-9c68-e96b8a5bd093
00000000-0000-0000-0000-000000000000	46	lnia4ljfxpby	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-27 10:40:35.350522+00	2026-03-27 11:49:29.518873+00	trheiana3xo3	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	53	jynmf2ormhph	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-27 11:49:29.521048+00	2026-03-27 12:47:30.1287+00	lnia4ljfxpby	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	54	42eek3nbja34	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 11:50:21.777249+00	2026-03-27 11:50:21.777249+00	\N	1ea9bcda-d193-46c9-a6be-babfa55c66f7
00000000-0000-0000-0000-000000000000	55	k3rb7fyyfqlo	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-27 11:50:56.007707+00	2026-03-27 11:50:56.007707+00	\N	5a15bbbf-2293-496d-a161-af51ab378a3c
00000000-0000-0000-0000-000000000000	56	xwhvpticdtvq	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 11:54:29.703779+00	2026-03-27 11:54:29.703779+00	\N	b962772a-c49f-407c-93b2-f1df73bdb703
00000000-0000-0000-0000-000000000000	57	7anfwsehocmh	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 12:14:52.789633+00	2026-03-27 12:14:52.789633+00	\N	88a6b041-2710-46fd-80a8-7aec4ca256e2
00000000-0000-0000-0000-000000000000	58	6xclfut53skr	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 12:16:32.525378+00	2026-03-27 12:16:32.525378+00	\N	828cb6d6-e265-48f4-966e-8108108ff31e
00000000-0000-0000-0000-000000000000	59	vt5l6onoksgt	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-27 12:16:55.893752+00	2026-03-27 12:16:55.893752+00	\N	5799f0db-4910-477c-b2b9-cb3787df542a
00000000-0000-0000-0000-000000000000	60	xhwy3h7li5z6	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 12:18:15.591139+00	2026-03-27 12:18:15.591139+00	\N	602a2e0d-2f63-4a8d-9ebd-5b9be5dcd500
00000000-0000-0000-0000-000000000000	61	otfij2e6oj7b	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 12:29:26.303184+00	2026-03-27 12:29:26.303184+00	\N	473cc46c-901b-4d49-a145-0febe23226c9
00000000-0000-0000-0000-000000000000	62	wa3xulcekgiw	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 12:39:33.052428+00	2026-03-27 12:39:33.052428+00	\N	29021b23-009b-4fb1-a8ed-cdfddf342a7d
00000000-0000-0000-0000-000000000000	63	3mjd3xbqxa4n	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-27 12:45:32.832629+00	2026-03-27 12:45:32.832629+00	\N	5651804c-c1b2-484f-8aa5-97f5618823f8
00000000-0000-0000-0000-000000000000	215	z3huww5rajg2	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-07 09:06:04.225083+00	2026-04-07 09:06:04.225083+00	\N	9afcad15-1003-4bb2-a172-295b7c76f597
00000000-0000-0000-0000-000000000000	65	puoxsfocznff	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-27 12:47:53.551574+00	2026-03-27 12:47:53.551574+00	\N	122a1c74-b34c-463d-9402-33eec0658e1b
00000000-0000-0000-0000-000000000000	66	dojqlw4aon23	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-27 12:48:52.667001+00	2026-03-27 12:48:52.667001+00	\N	1c07d599-6169-427e-9c68-05103d60e12d
00000000-0000-0000-0000-000000000000	67	fe3wupusnfix	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-27 12:51:29.669126+00	2026-03-27 12:51:29.669126+00	\N	afc50ecc-32d4-4efd-b3ac-e16f5d59127a
00000000-0000-0000-0000-000000000000	64	ivkvbj6qj7y4	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-27 12:47:30.136616+00	2026-03-28 05:26:51.81981+00	jynmf2ormhph	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	69	tttejsmm4liv	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-28 05:27:34.077298+00	2026-03-28 05:27:34.077298+00	\N	d7f87781-fda4-4444-8f1e-4a068d072c26
00000000-0000-0000-0000-000000000000	70	vhrrlnzlhi5e	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	t	2026-03-28 06:02:50.860244+00	2026-03-28 07:13:18.962598+00	\N	188d4b0e-c1dc-4516-acc6-ea30afd1ab85
00000000-0000-0000-0000-000000000000	71	5rgtyt3uje2q	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-28 07:13:18.985407+00	2026-03-28 07:13:18.985407+00	vhrrlnzlhi5e	188d4b0e-c1dc-4516-acc6-ea30afd1ab85
00000000-0000-0000-0000-000000000000	68	szmxqblwphqa	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-28 05:26:51.841357+00	2026-03-28 07:13:23.813504+00	ivkvbj6qj7y4	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	72	vav3unymczrg	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-28 07:13:23.814522+00	2026-03-28 11:33:54.544974+00	szmxqblwphqa	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	74	n3mmszbhnmtz	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 11:34:13.13624+00	2026-03-28 12:53:31.642226+00	\N	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	75	vfwez544kgr7	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 12:53:31.659768+00	2026-03-28 13:54:24.464084+00	n3mmszbhnmtz	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	76	45juzy7fa3au	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 13:54:24.476599+00	2026-03-28 14:55:32.325714+00	vfwez544kgr7	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	77	dxyxssc3qfol	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 14:55:32.338738+00	2026-03-28 15:56:38.251242+00	45juzy7fa3au	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	78	jbwy6igdbdxm	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 15:56:38.260244+00	2026-03-28 16:57:44.41059+00	dxyxssc3qfol	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	79	a2f576kotixr	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 16:57:44.426238+00	2026-03-28 17:58:51.050811+00	jbwy6igdbdxm	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	80	32ghn4dc7fyl	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 17:58:51.063504+00	2026-03-28 18:59:56.305619+00	a2f576kotixr	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	81	qiq7ylju4a2h	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 18:59:56.316264+00	2026-03-28 20:01:01.766439+00	32ghn4dc7fyl	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	82	3kztymxfsbkk	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 20:01:01.780579+00	2026-03-28 21:02:09.242425+00	qiq7ylju4a2h	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	83	l36diieutmwv	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 21:02:09.255018+00	2026-03-28 22:03:14.910396+00	3kztymxfsbkk	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	84	a7vvcbpzusyr	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 22:03:14.923163+00	2026-03-28 23:04:20.795334+00	l36diieutmwv	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	85	ecbxgodq6yii	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-28 23:04:20.809862+00	2026-03-29 00:05:27.665656+00	a7vvcbpzusyr	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	86	qd7fkdj3ida6	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 00:05:27.686111+00	2026-03-29 01:06:46.287835+00	ecbxgodq6yii	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	87	dcuhfjeh7wvx	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 01:06:46.306965+00	2026-03-29 02:07:39.026453+00	qd7fkdj3ida6	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	88	oesxu2iyaoan	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 02:07:39.042811+00	2026-03-29 03:08:45.846839+00	dcuhfjeh7wvx	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	89	glnqzas6sx2w	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 03:08:45.858394+00	2026-03-29 04:10:01.30772+00	oesxu2iyaoan	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	90	o546wzwliab5	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 04:10:01.319069+00	2026-03-29 05:11:01.751391+00	glnqzas6sx2w	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	91	kwpn2mx3anh5	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 05:11:01.764661+00	2026-03-29 06:12:04.831463+00	o546wzwliab5	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	92	xxzq5iamv5n2	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 06:12:04.845864+00	2026-03-29 07:13:06.456944+00	kwpn2mx3anh5	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	93	wcepltmlypqp	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 07:13:06.474155+00	2026-03-29 08:14:14.812361+00	xxzq5iamv5n2	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	94	focgngroyf65	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 08:14:14.838184+00	2026-03-29 09:15:38.271649+00	wcepltmlypqp	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	95	hjpasit6mws2	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 09:15:38.296287+00	2026-03-29 10:16:28.301129+00	focgngroyf65	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	96	hcrg4gbzjipx	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 10:16:28.311033+00	2026-03-29 11:17:46.891591+00	hjpasit6mws2	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	97	3hrrlvmxboqv	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 11:17:46.907687+00	2026-03-29 12:18:46.579747+00	hcrg4gbzjipx	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	98	nz4kuhlgxmnr	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 12:18:46.59045+00	2026-03-29 13:19:40.041626+00	3hrrlvmxboqv	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	99	2w7zhx2koptf	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 13:19:40.054821+00	2026-03-29 14:20:40.852888+00	nz4kuhlgxmnr	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	100	sxvqwiisdvsd	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 14:20:40.862477+00	2026-03-29 15:21:46.757308+00	2w7zhx2koptf	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	101	fkbxyquth4ir	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 15:21:46.77326+00	2026-03-29 16:23:03.621086+00	sxvqwiisdvsd	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	102	ihexitprbmzw	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 16:23:03.634471+00	2026-03-29 17:24:04.492592+00	fkbxyquth4ir	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	103	c4daz4dlgl74	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 17:24:04.508921+00	2026-03-29 18:25:05.081321+00	ihexitprbmzw	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	104	cwksiywrmg7y	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 18:25:05.097813+00	2026-03-29 19:26:08.552106+00	c4daz4dlgl74	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	73	rg5klmb56jzs	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-28 11:33:54.560052+00	2026-03-30 04:44:37.039007+00	vav3unymczrg	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	105	e7z73q3u2cs3	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 19:26:08.573085+00	2026-03-29 20:27:26.357391+00	cwksiywrmg7y	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	106	bclyct7v3ezb	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 20:27:26.375685+00	2026-03-29 21:28:23.743753+00	e7z73q3u2cs3	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	107	zprxep7humdv	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 21:28:23.758404+00	2026-03-29 22:29:29.423578+00	bclyct7v3ezb	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	108	h5ervkghueuv	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 22:29:29.437748+00	2026-03-29 23:30:50.89238+00	zprxep7humdv	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	109	4leymvi422uo	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-29 23:30:50.910945+00	2026-03-30 00:31:48.287291+00	h5ervkghueuv	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	110	vh5ha6ys5ieh	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-30 00:31:48.302687+00	2026-03-30 01:32:48.200938+00	4leymvi422uo	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	111	kcooa4plq2lu	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-30 01:32:48.219345+00	2026-03-30 02:33:50.613181+00	vh5ha6ys5ieh	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	112	5u7ggp7hawz6	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-30 02:33:50.632316+00	2026-03-30 03:35:00.256543+00	kcooa4plq2lu	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	113	wn3jloc4jg47	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-30 03:35:00.270158+00	2026-03-30 04:36:07.360885+00	5u7ggp7hawz6	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	114	bj4fkvmaxj34	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-30 04:36:07.365521+00	2026-03-30 04:36:07.365521+00	wn3jloc4jg47	82aba822-3b5e-4e69-bcb5-cb5c591db2fb
00000000-0000-0000-0000-000000000000	117	qdmpqsf6yhx6	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-30 04:53:49.390186+00	2026-03-30 04:53:49.390186+00	\N	cb9e75e7-9f14-43dd-b519-dfe2435425c7
00000000-0000-0000-0000-000000000000	116	n6bfs3zfm3uw	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	t	2026-03-30 04:45:06.957542+00	2026-03-30 05:43:18.730997+00	\N	905350a2-995e-4c76-bb3c-4ec18d3f1d13
00000000-0000-0000-0000-000000000000	119	k2gvnxgt6u5q	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-30 05:43:18.746726+00	2026-03-30 05:43:18.746726+00	n6bfs3zfm3uw	905350a2-995e-4c76-bb3c-4ec18d3f1d13
00000000-0000-0000-0000-000000000000	118	vglllgsz33qk	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-30 05:04:32.197962+00	2026-03-30 06:02:50.986328+00	\N	ff52101a-e40e-4cb7-9385-88455c1465ba
00000000-0000-0000-0000-000000000000	120	qnnfkjozmmhl	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-03-30 06:02:51.007848+00	2026-03-30 07:01:21.890897+00	vglllgsz33qk	ff52101a-e40e-4cb7-9385-88455c1465ba
00000000-0000-0000-0000-000000000000	121	zfbh25yhqrlp	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-30 07:01:21.909164+00	2026-03-30 07:01:21.909164+00	qnnfkjozmmhl	ff52101a-e40e-4cb7-9385-88455c1465ba
00000000-0000-0000-0000-000000000000	115	64g5qwggh4pz	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-30 04:44:37.046442+00	2026-03-30 09:06:50.123969+00	rg5klmb56jzs	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	123	5z4qsavn6db4	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-30 09:18:10.405518+00	2026-03-30 09:18:10.405518+00	\N	ccb13c8d-9a87-40b8-b221-68cff5753768
00000000-0000-0000-0000-000000000000	124	kc2s2bphyi5c	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-30 09:19:27.301658+00	2026-03-30 09:19:27.301658+00	\N	86cf510b-0a48-4674-bd65-114ff43dcf92
00000000-0000-0000-0000-000000000000	125	vcoocvbuyf77	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-30 09:30:46.005807+00	2026-03-30 09:30:46.005807+00	\N	ce262467-24c7-499d-8ac6-da3a25e906f4
00000000-0000-0000-0000-000000000000	126	dpgyd7jyvzxh	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-30 09:31:24.401875+00	2026-03-30 09:31:24.401875+00	\N	b87657e6-ef82-4478-91a8-d714ec1b6744
00000000-0000-0000-0000-000000000000	127	yqi4htdwmpq6	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-30 09:32:37.867837+00	2026-03-30 10:30:41.17633+00	\N	f86cba51-11c0-444f-854a-eb9d8d215967
00000000-0000-0000-0000-000000000000	128	uycdwromlzk3	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-30 10:30:41.201549+00	2026-03-30 11:28:58.990919+00	yqi4htdwmpq6	f86cba51-11c0-444f-854a-eb9d8d215967
00000000-0000-0000-0000-000000000000	122	xfvrolidmjpu	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-30 09:06:50.13941+00	2026-03-30 11:36:37.687407+00	64g5qwggh4pz	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	131	mmdgx74b22f5	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-30 11:36:53.280226+00	2026-03-30 11:36:53.280226+00	\N	a4896750-3e6a-4d2a-bec6-f0b4762fcf00
00000000-0000-0000-0000-000000000000	132	lx6nyp6suhhi	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-30 11:44:16.960456+00	2026-03-30 11:44:16.960456+00	\N	c84d7d0b-61de-46ef-aa56-77afac50dbc2
00000000-0000-0000-0000-000000000000	133	awidrilx3fyc	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-30 11:47:03.269983+00	2026-03-30 11:47:03.269983+00	\N	2080a195-ba47-4612-8942-d8e69d118694
00000000-0000-0000-0000-000000000000	134	uzbiwjl5x6v3	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-30 11:54:15.919187+00	2026-03-30 11:54:15.919187+00	\N	faebe441-f32d-47c6-b81f-5143f899b1df
00000000-0000-0000-0000-000000000000	135	e4khboe4zxhs	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-30 11:56:27.729107+00	2026-03-30 11:56:27.729107+00	\N	e01c7d20-2eb0-4c59-8bd2-b718dbb79435
00000000-0000-0000-0000-000000000000	136	o6wz5edi4uww	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-30 11:59:16.455494+00	2026-03-30 11:59:16.455494+00	\N	23ef0a5e-6fc2-4c03-97f3-ec028fb50b34
00000000-0000-0000-0000-000000000000	137	uh4h4kinumyu	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-30 12:02:47.16595+00	2026-03-30 12:02:47.16595+00	\N	2d1ac820-6f10-4e7d-a13c-624696157cab
00000000-0000-0000-0000-000000000000	138	nnrlqctnf7t3	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-30 12:03:20.028067+00	2026-03-30 12:03:20.028067+00	\N	cdfeda14-feeb-4975-b1a4-474e91551186
00000000-0000-0000-0000-000000000000	139	gblp7haullmy	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-30 12:20:54.666455+00	2026-03-30 12:20:54.666455+00	\N	714702ec-a70d-4809-826c-4476d5503478
00000000-0000-0000-0000-000000000000	140	efkxptlowzwc	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-30 12:21:32.548293+00	2026-03-30 12:21:32.548293+00	\N	e2d0e919-8381-4327-aa0d-4c6602a8d930
00000000-0000-0000-0000-000000000000	129	7pjpxxz4tgib	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-30 11:28:59.000086+00	2026-03-30 12:27:28.965597+00	uycdwromlzk3	f86cba51-11c0-444f-854a-eb9d8d215967
00000000-0000-0000-0000-000000000000	141	iiqtp2y5ckkh	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-30 12:27:28.988706+00	2026-03-30 12:27:28.988706+00	7pjpxxz4tgib	f86cba51-11c0-444f-854a-eb9d8d215967
00000000-0000-0000-0000-000000000000	142	nx3xomrqhgov	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-30 12:31:11.216282+00	2026-03-30 12:31:11.216282+00	\N	cf4e34c1-a692-4846-803c-54efbea8fbb0
00000000-0000-0000-0000-000000000000	143	jqqkqbghptkb	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-31 06:11:24.725462+00	2026-03-31 06:11:24.725462+00	\N	aeff1c80-45fb-47aa-9398-226df10a711a
00000000-0000-0000-0000-000000000000	130	6tq6ud3t6y4p	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-30 11:36:37.702494+00	2026-03-31 06:11:55.019167+00	xfvrolidmjpu	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	145	tanumxmvugp7	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-31 06:15:03.354514+00	2026-03-31 06:15:03.354514+00	\N	54b170ae-bc29-4667-ab92-599295f814a5
00000000-0000-0000-0000-000000000000	146	jxmxwp4epywz	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 06:15:43.40687+00	2026-03-31 06:15:43.40687+00	\N	06805cd3-cce3-4391-a2c8-921013f8bb4a
00000000-0000-0000-0000-000000000000	147	xhzidwmiqqrs	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-31 06:16:09.020288+00	2026-03-31 06:16:09.020288+00	\N	a4129b7d-2939-43be-9566-bc38cd4544ff
00000000-0000-0000-0000-000000000000	148	oo2e32pqzcbm	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-31 06:17:06.675872+00	2026-03-31 07:15:32.563443+00	\N	b3669d3a-6380-4487-93f1-442bedf211aa
00000000-0000-0000-0000-000000000000	149	6qivdzhmdwes	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-31 07:15:32.585827+00	2026-03-31 08:13:33.437233+00	oo2e32pqzcbm	b3669d3a-6380-4487-93f1-442bedf211aa
00000000-0000-0000-0000-000000000000	150	niiaorqyn6gd	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-31 08:13:33.459388+00	2026-03-31 09:11:34.2522+00	6qivdzhmdwes	b3669d3a-6380-4487-93f1-442bedf211aa
00000000-0000-0000-0000-000000000000	151	sfx534ov2ccd	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-31 08:16:40.365999+00	2026-03-31 09:15:08.864725+00	\N	0bcce1fb-90d0-4612-b68d-7204e9419107
00000000-0000-0000-0000-000000000000	152	lvbatf2pyuyq	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-31 09:11:34.275402+00	2026-03-31 10:09:36.766417+00	niiaorqyn6gd	b3669d3a-6380-4487-93f1-442bedf211aa
00000000-0000-0000-0000-000000000000	154	vheqvnfkjr77	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 10:09:36.782808+00	2026-03-31 10:09:36.782808+00	lvbatf2pyuyq	b3669d3a-6380-4487-93f1-442bedf211aa
00000000-0000-0000-0000-000000000000	153	ke637shiqs3m	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-03-31 09:15:08.866823+00	2026-03-31 10:13:09.156244+00	sfx534ov2ccd	0bcce1fb-90d0-4612-b68d-7204e9419107
00000000-0000-0000-0000-000000000000	155	atmnek35hn4n	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 10:13:09.170907+00	2026-03-31 10:13:09.170907+00	ke637shiqs3m	0bcce1fb-90d0-4612-b68d-7204e9419107
00000000-0000-0000-0000-000000000000	144	ysiwwjznwtiy	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-31 06:11:55.054569+00	2026-03-31 10:38:53.535449+00	6tq6ud3t6y4p	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	156	xri4e6lqrseg	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-31 10:38:53.551473+00	2026-03-31 11:37:03.379168+00	ysiwwjznwtiy	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	157	sdt6zosr4nw7	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-31 10:39:12.157888+00	2026-03-31 10:39:12.157888+00	\N	9e5d198c-abe7-4707-9b43-f873bc904c51
00000000-0000-0000-0000-000000000000	158	wly46l3uacbl	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-31 10:41:24.094844+00	2026-03-31 10:41:24.094844+00	\N	5d7008f2-5a47-4e1d-89fd-bb23e356dacf
00000000-0000-0000-0000-000000000000	159	vucveiv3jmgt	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-03-31 10:42:41.843955+00	2026-03-31 10:42:41.843955+00	\N	4cdf4ede-6d2c-4026-8e44-3cea4ef464e3
00000000-0000-0000-0000-000000000000	160	6hrlvpf3ehe2	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 10:46:23.515369+00	2026-03-31 10:46:23.515369+00	\N	f007267f-df66-4073-b305-231c460be44b
00000000-0000-0000-0000-000000000000	161	37orvcqsgxer	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 10:54:08.392251+00	2026-03-31 10:54:08.392251+00	\N	721193d4-6841-44d1-9c6e-5d4ffd1b73b3
00000000-0000-0000-0000-000000000000	162	p7vqr6kakoim	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 11:28:08.275336+00	2026-03-31 11:28:08.275336+00	\N	08349095-c457-4849-96c1-6e0c1280eac1
00000000-0000-0000-0000-000000000000	163	nnpuxwvpvpt5	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-03-31 11:33:00.660635+00	2026-03-31 11:33:00.660635+00	\N	8a9c23a6-11eb-4bc9-a748-5c76101ef4de
00000000-0000-0000-0000-000000000000	164	emkfg6qzm5m5	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-31 11:36:36.351433+00	2026-03-31 11:36:36.351433+00	\N	1895f912-6cac-443c-a7be-2ec33c2eaab7
00000000-0000-0000-0000-000000000000	166	mc3wcq5togri	4facc115-e468-4660-b440-2228132ab9d7	f	2026-03-31 11:40:47.089447+00	2026-03-31 11:40:47.089447+00	\N	7cb56bda-f645-465b-ba2c-2dc973d87abb
00000000-0000-0000-0000-000000000000	167	k2abp6p2xvza	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-03-31 11:41:12.113985+00	2026-03-31 11:41:12.113985+00	\N	4e1c318e-f3b7-4daa-bab6-d088bb55649a
00000000-0000-0000-0000-000000000000	169	uvv3cwkpdzzb	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-31 12:35:16.632045+00	2026-04-08 09:06:35.568911+00	5uhdif5qgzja	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	165	5uhdif5qgzja	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-03-31 11:37:03.381369+00	2026-03-31 12:35:16.613834+00	xri4e6lqrseg	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	168	3wpg2yigteeu	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	t	2026-03-31 11:56:01.173225+00	2026-03-31 12:54:07.150825+00	\N	4b52b854-5579-47c8-871e-bb5b0a50cae9
00000000-0000-0000-0000-000000000000	170	l3tj3frja6wm	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-03-31 12:54:07.187145+00	2026-03-31 12:54:07.187145+00	3wpg2yigteeu	4b52b854-5579-47c8-871e-bb5b0a50cae9
00000000-0000-0000-0000-000000000000	171	uhvigoyfrsux	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-04-01 05:06:34.161419+00	2026-04-01 05:06:34.161419+00	\N	76c0f0d6-1f60-4e80-b263-482898874c18
00000000-0000-0000-0000-000000000000	172	wrd74ihyltof	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 11:41:41.485658+00	2026-04-02 11:41:41.485658+00	\N	8c0d83dc-9259-42ef-a11a-4a763549c0d8
00000000-0000-0000-0000-000000000000	174	szadjvz3beww	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 11:50:34.586056+00	2026-04-02 11:50:34.586056+00	\N	f3c2a237-09fe-45bc-a326-490b935ce4d3
00000000-0000-0000-0000-000000000000	175	qaeasyp2c2po	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 12:05:55.315845+00	2026-04-02 12:05:55.315845+00	\N	07c5f6c5-0cd1-4116-8423-7e1f797d2998
00000000-0000-0000-0000-000000000000	176	vf75b6wr53v5	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 12:06:29.513049+00	2026-04-02 12:06:29.513049+00	\N	c9b4ad0f-ee5f-4c39-a7bb-fd5ddbc310cb
00000000-0000-0000-0000-000000000000	178	kbujfvzjxksy	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 12:08:01.938857+00	2026-04-02 12:08:01.938857+00	\N	6db7ee20-69ce-424b-a942-932e36bd4672
00000000-0000-0000-0000-000000000000	179	vwdnhtb33zyu	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 12:08:42.806236+00	2026-04-02 12:08:42.806236+00	\N	ed71c346-7a70-4a14-ba36-af2c675f6af4
00000000-0000-0000-0000-000000000000	173	5wfadclk2cv3	b7271c67-b547-4252-a4df-925b2cdcdebe	t	2026-04-02 11:44:08.024625+00	2026-04-02 12:42:33.576313+00	\N	4cfd132d-d2c4-4362-a7af-cddf20935b6d
00000000-0000-0000-0000-000000000000	180	qbqymujztvup	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 12:42:33.590926+00	2026-04-02 12:42:33.590926+00	5wfadclk2cv3	4cfd132d-d2c4-4362-a7af-cddf20935b6d
00000000-0000-0000-0000-000000000000	177	a5eielulxybo	b7271c67-b547-4252-a4df-925b2cdcdebe	t	2026-04-02 12:06:38.489571+00	2026-04-02 13:05:02.595089+00	\N	635c96d5-16f0-422c-9120-c309861d1dab
00000000-0000-0000-0000-000000000000	181	r7imqc757vft	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 13:05:02.608484+00	2026-04-02 13:05:02.608484+00	a5eielulxybo	635c96d5-16f0-422c-9120-c309861d1dab
00000000-0000-0000-0000-000000000000	182	mchh5pdgjtsk	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-02 13:24:08.942108+00	2026-04-02 13:24:08.942108+00	\N	11a095fb-7039-4ace-8bc1-7bd7c0d8af91
00000000-0000-0000-0000-000000000000	183	cezhwuek6k3z	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 13:28:52.869533+00	2026-04-02 13:28:52.869533+00	\N	743f84a1-0998-4cc8-8f7c-0eebc03c1c0a
00000000-0000-0000-0000-000000000000	184	mkop4rl5bppf	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-02 13:46:22.387721+00	2026-04-02 13:46:22.387721+00	\N	e92c1c17-f2fb-407d-a80c-640afc77f5a5
00000000-0000-0000-0000-000000000000	185	ioxhv6c3mmrw	4facc115-e468-4660-b440-2228132ab9d7	f	2026-04-02 13:47:44.405294+00	2026-04-02 13:47:44.405294+00	\N	8d117774-5aca-4e56-8019-4a2174f204f8
00000000-0000-0000-0000-000000000000	186	kh6awzkwggkg	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-03 04:57:11.273955+00	2026-04-03 04:57:11.273955+00	\N	fa2580eb-6ae8-4487-832f-b76fb377e958
00000000-0000-0000-0000-000000000000	187	xhmbfj4y6mrt	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-04-03 05:07:52.791411+00	2026-04-03 05:07:52.791411+00	\N	490afe5a-c0a0-4722-932f-46df7f2d72ce
00000000-0000-0000-0000-000000000000	188	usfcepr6qvkr	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-04-03 05:08:51.439128+00	2026-04-03 05:08:51.439128+00	\N	b3f02c90-8483-44d8-bb08-655591bdbf16
00000000-0000-0000-0000-000000000000	189	pwgfivzwdui2	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-03 05:28:18.70595+00	2026-04-03 05:28:18.70595+00	\N	59cfa726-8cc8-4f00-8b23-39b1bb7060ef
00000000-0000-0000-0000-000000000000	190	e7hvlwwzol7m	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-03 05:39:35.720804+00	2026-04-03 05:39:35.720804+00	\N	35f8f65a-16fc-4ef7-8fee-f410dc4d6ca2
00000000-0000-0000-0000-000000000000	191	gqp7jtzqdnuk	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-03 09:50:50.283036+00	2026-04-03 09:50:50.283036+00	\N	d661f81c-6fe8-41ed-ac00-7cd04368be1d
00000000-0000-0000-0000-000000000000	192	4ikr5fegkqnh	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-04-03 10:28:07.124561+00	2026-04-03 10:28:07.124561+00	\N	ea4eb1ef-26c1-476e-8a1b-7f5f229292f5
00000000-0000-0000-0000-000000000000	193	7uxbl4pvxa3k	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-03 10:32:51.346834+00	2026-04-03 10:32:51.346834+00	\N	c86e399b-910a-47f2-9e57-690b5147795b
00000000-0000-0000-0000-000000000000	194	efw6hniapffr	4facc115-e468-4660-b440-2228132ab9d7	f	2026-04-03 10:34:43.011513+00	2026-04-03 10:34:43.011513+00	\N	56a2da5f-6659-4bec-94b4-78218a851724
00000000-0000-0000-0000-000000000000	195	hqmezhdiltxe	b7271c67-b547-4252-a4df-925b2cdcdebe	t	2026-04-03 10:35:20.381285+00	2026-04-03 11:33:39.927766+00	\N	85148157-35c7-4d35-895a-51fcc087166c
00000000-0000-0000-0000-000000000000	196	ngpmbc2piczs	b7271c67-b547-4252-a4df-925b2cdcdebe	f	2026-04-03 11:33:39.945823+00	2026-04-03 11:33:39.945823+00	hqmezhdiltxe	85148157-35c7-4d35-895a-51fcc087166c
00000000-0000-0000-0000-000000000000	197	webgw2mgvhil	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-04-06 04:20:45.073459+00	2026-04-06 04:20:45.073459+00	\N	d5c9b095-7f28-4e5d-8823-e4a9e0d29b0f
00000000-0000-0000-0000-000000000000	198	nlzbusu4otoj	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-06 04:47:12.423099+00	2026-04-06 04:47:12.423099+00	\N	c7556287-e596-4d0d-b4b6-08e1d7d5ea50
00000000-0000-0000-0000-000000000000	199	id4mhmakfegj	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-06 05:39:36.498296+00	2026-04-06 05:39:36.498296+00	\N	2f93e346-d8b0-40a5-a153-7681276c47bd
00000000-0000-0000-0000-000000000000	200	5rdig5a4cd2y	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	f	2026-04-06 06:09:28.439923+00	2026-04-06 06:09:28.439923+00	\N	90fd47b6-0e1d-4343-83f1-8c21ca2d5c26
00000000-0000-0000-0000-000000000000	201	kbknygj6qkgp	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-04-06 06:25:45.82652+00	2026-04-06 06:25:45.82652+00	\N	caea5e55-ec23-4520-9997-16b057ea90a3
00000000-0000-0000-0000-000000000000	202	c4dcfmshk6p3	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-06 06:32:01.598318+00	2026-04-06 06:32:01.598318+00	\N	d1b72642-b7f9-418a-bccd-04bea79c212e
00000000-0000-0000-0000-000000000000	203	7kiuu6fecjwj	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-06 06:38:45.995698+00	2026-04-06 06:38:45.995698+00	\N	b8d6e757-0a6d-4bd0-88e7-cab95e8e6d4a
00000000-0000-0000-0000-000000000000	204	auui6dlus2cg	4facc115-e468-4660-b440-2228132ab9d7	t	2026-04-06 06:40:19.600971+00	2026-04-06 07:43:24.973605+00	\N	ef0a0428-d868-43c7-b18b-5d6f04b1cb4c
00000000-0000-0000-0000-000000000000	205	g7zqi2h3xz4m	4facc115-e468-4660-b440-2228132ab9d7	t	2026-04-06 07:43:24.994457+00	2026-04-06 08:41:45.918273+00	auui6dlus2cg	ef0a0428-d868-43c7-b18b-5d6f04b1cb4c
00000000-0000-0000-0000-000000000000	206	yhyar6fteyux	4facc115-e468-4660-b440-2228132ab9d7	f	2026-04-06 08:41:45.933506+00	2026-04-06 08:41:45.933506+00	g7zqi2h3xz4m	ef0a0428-d868-43c7-b18b-5d6f04b1cb4c
00000000-0000-0000-0000-000000000000	207	stidomrwaur7	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-06 11:41:27.288628+00	2026-04-06 11:41:27.288628+00	\N	c6b552bd-7114-4150-bd81-ed5a6c19700b
00000000-0000-0000-0000-000000000000	208	45adgljlhuav	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-06 12:01:48.013945+00	2026-04-06 12:01:48.013945+00	\N	dd93361a-cbb1-41e3-92b1-64d44b3e634b
00000000-0000-0000-0000-000000000000	209	nsbwb5tmxkbf	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-07 05:44:26.388006+00	2026-04-07 05:44:26.388006+00	\N	7229a461-997c-4d20-8651-2d9a45cb0642
00000000-0000-0000-0000-000000000000	213	htw2mss4jdj4	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-07 07:45:26.625292+00	2026-04-07 08:43:32.70311+00	sage6vpqm2vj	6e8f6a87-87ff-42d0-bd74-0b363aaf3f02
00000000-0000-0000-0000-000000000000	210	4ysw26umcuis	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-07 05:48:52.994295+00	2026-04-07 06:46:56.409045+00	\N	6e8f6a87-87ff-42d0-bd74-0b363aaf3f02
00000000-0000-0000-0000-000000000000	216	oq3p2ims7ggx	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-07 09:44:39.118523+00	2026-04-07 10:43:03.221641+00	\N	904b4d5f-df5a-4857-8d02-b4cb59eef77d
00000000-0000-0000-0000-000000000000	212	wteihb5thzbo	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-07 07:23:32.796596+00	2026-04-07 07:23:32.796596+00	\N	c038385c-078a-4c6e-9090-451edaee8dae
00000000-0000-0000-0000-000000000000	211	sage6vpqm2vj	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-07 06:46:56.433498+00	2026-04-07 07:45:26.58892+00	4ysw26umcuis	6e8f6a87-87ff-42d0-bd74-0b363aaf3f02
00000000-0000-0000-0000-000000000000	217	y74xtkhx5axc	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-07 10:43:03.248026+00	2026-04-07 11:46:17.20923+00	oq3p2ims7ggx	904b4d5f-df5a-4857-8d02-b4cb59eef77d
00000000-0000-0000-0000-000000000000	218	afnitzuip4db	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-07 11:46:17.219653+00	2026-04-07 12:44:40.539351+00	y74xtkhx5axc	904b4d5f-df5a-4857-8d02-b4cb59eef77d
00000000-0000-0000-0000-000000000000	219	weqmboizdhuz	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-07 12:44:40.558752+00	2026-04-07 12:44:40.558752+00	afnitzuip4db	904b4d5f-df5a-4857-8d02-b4cb59eef77d
00000000-0000-0000-0000-000000000000	220	2gcfn4v5xgvv	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-07 13:06:11.279265+00	2026-04-07 13:06:11.279265+00	\N	7aa55054-b0d7-42e1-ba12-b23da61efa8e
00000000-0000-0000-0000-000000000000	221	omzvaqlrl5in	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	f	2026-04-08 06:27:45.69998+00	2026-04-08 06:27:45.69998+00	\N	24a8b029-aba0-4821-aa12-226436108f87
00000000-0000-0000-0000-000000000000	222	zutxaty5woel	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-08 09:00:48.782896+00	2026-04-08 09:00:48.782896+00	\N	3d7da303-9810-450b-aa50-4357696d2a6b
00000000-0000-0000-0000-000000000000	223	sx6sszeogech	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-08 09:01:51.864903+00	2026-04-08 09:01:51.864903+00	\N	7a27a9d2-3669-4536-acec-084edf669da5
00000000-0000-0000-0000-000000000000	224	iq7d4bprsscz	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-08 09:03:11.824662+00	2026-04-08 09:03:11.824662+00	\N	f7538dc9-96fc-428f-9405-061cf5f3fd25
00000000-0000-0000-0000-000000000000	225	a2ouh5os6qrr	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-08 09:04:50.64751+00	2026-04-08 09:04:50.64751+00	\N	1fbfd54b-1601-4de6-8105-0dc66b51cbbf
00000000-0000-0000-0000-000000000000	227	lqzxjth4k5uf	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-08 09:44:10.408589+00	2026-04-08 09:44:10.408589+00	\N	83268703-7c40-4107-82a7-a967c7526c9e
00000000-0000-0000-0000-000000000000	228	amj6hwsg4fge	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-04-09 06:33:06.302822+00	2026-04-09 07:51:20.808771+00	\N	70d99088-f7c1-446a-a2ba-f79fc26f9504
00000000-0000-0000-0000-000000000000	229	42vh24zxilvh	01ce5190-59c2-4df5-9190-fa40b2eacea5	t	2026-04-09 07:51:20.833647+00	2026-04-09 08:49:31.492426+00	amj6hwsg4fge	70d99088-f7c1-446a-a2ba-f79fc26f9504
00000000-0000-0000-0000-000000000000	230	bhdisrtszdce	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-09 08:49:31.514629+00	2026-04-09 08:49:31.514629+00	42vh24zxilvh	70d99088-f7c1-446a-a2ba-f79fc26f9504
00000000-0000-0000-0000-000000000000	226	nutkals5mftm	941d29b5-c66f-4f5e-bc75-a1da83842e5b	t	2026-04-08 09:06:35.580533+00	2026-04-09 09:26:45.812332+00	uvv3cwkpdzzb	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	232	zor74rpgg3pt	941d29b5-c66f-4f5e-bc75-a1da83842e5b	f	2026-04-09 09:26:45.823355+00	2026-04-09 09:26:45.823355+00	nutkals5mftm	e0b692f7-50a5-4905-b404-4e84c4ee54ef
00000000-0000-0000-0000-000000000000	231	7qz7fr3ez3su	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-09 09:25:49.849645+00	2026-04-09 10:24:06.292379+00	\N	a292dbe8-92fe-4ded-85a3-f80d8ebf65cd
00000000-0000-0000-0000-000000000000	233	dfa4luhje6d7	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	t	2026-04-09 10:24:06.317772+00	2026-04-09 11:32:13.048895+00	7qz7fr3ez3su	a292dbe8-92fe-4ded-85a3-f80d8ebf65cd
00000000-0000-0000-0000-000000000000	234	3u22wlautx54	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	f	2026-04-09 11:32:13.072772+00	2026-04-09 11:32:13.072772+00	dfa4luhje6d7	a292dbe8-92fe-4ded-85a3-f80d8ebf65cd
00000000-0000-0000-0000-000000000000	235	us634verydpe	01ce5190-59c2-4df5-9190-fa40b2eacea5	f	2026-04-09 12:10:44.112205+00	2026-04-09 12:10:44.112205+00	\N	302811d2-e583-4915-84e4-d83ac6720615
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
7266bf27-c2e4-42ae-9f72-9eb56bdd553a	572d0b22-e590-4dd6-a64b-19e9a3dbd048	2026-03-26 09:06:48.930218+00	2026-03-26 09:06:48.930218+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	59.88.203.161	\N	\N	\N	\N	\N
cfbd25f2-eed9-4495-946e-cba11946596d	941d29b5-c66f-4f5e-bc75-a1da83842e5b	2026-03-26 09:28:12.74724+00	2026-03-26 09:28:12.74724+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
0a91b5e0-18e6-4193-bf87-f4f79328599d	941d29b5-c66f-4f5e-bc75-a1da83842e5b	2026-03-26 09:56:18.963745+00	2026-03-26 09:56:18.963745+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
a0af65cf-ae9a-4308-9f47-9be2bb45d2fb	941d29b5-c66f-4f5e-bc75-a1da83842e5b	2026-03-26 10:17:15.340652+00	2026-03-26 10:17:15.340652+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
0a3ebf09-f252-4dfc-b61b-1d2c75847358	941d29b5-c66f-4f5e-bc75-a1da83842e5b	2026-03-26 10:37:28.099033+00	2026-03-26 10:37:28.099033+00	\N	aal1	\N	\N	node	34.207.210.253	\N	\N	\N	\N	\N
f6948a23-9a31-4127-9620-27e7bce8b3d0	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-26 11:03:32.767986+00	2026-03-26 11:03:32.767986+00	\N	aal1	\N	\N	node	44.213.72.223	\N	\N	\N	\N	\N
2501b1e5-39b6-44ba-9490-11772b9645c7	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-26 11:09:22.774175+00	2026-03-26 11:09:22.774175+00	\N	aal1	\N	\N	node	44.213.72.223	\N	\N	\N	\N	\N
1fdb7fbc-d95d-4e4b-ac8f-edd93b41f64e	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-26 11:39:23.158902+00	2026-03-26 11:39:23.158902+00	\N	aal1	\N	\N	node	3.87.28.139	\N	\N	\N	\N	\N
35235c4c-4ac7-4a46-b238-c852d0f239b4	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-26 11:42:41.672186+00	2026-03-26 11:42:41.672186+00	\N	aal1	\N	\N	node	54.81.232.2	\N	\N	\N	\N	\N
2e51fc3a-ed58-4d3d-a046-542ee256d43a	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-26 11:44:57.104282+00	2026-03-26 11:44:57.104282+00	\N	aal1	\N	\N	node	35.168.62.225	\N	\N	\N	\N	\N
36001dfa-861e-4231-9609-7a82747ab839	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-26 11:49:55.127809+00	2026-03-26 11:49:55.127809+00	\N	aal1	\N	\N	node	35.168.62.225	\N	\N	\N	\N	\N
cb9e75e7-9f14-43dd-b519-dfe2435425c7	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-30 04:53:49.36927+00	2026-03-30 04:53:49.36927+00	\N	aal1	\N	\N	node	223.181.117.118	\N	\N	\N	\N	\N
2dc517a8-cfb1-460a-9e8e-c99bfe707818	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-26 12:04:36.72354+00	2026-03-26 12:04:36.72354+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
b50627b0-7578-46a7-8ec3-1ff8bd786784	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-26 12:05:51.834268+00	2026-03-26 12:05:51.834268+00	\N	aal1	\N	\N	node	54.204.124.109	\N	\N	\N	\N	\N
0509ac5c-db98-4ae1-ab52-c138138c132a	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-26 12:09:31.592249+00	2026-03-26 12:09:31.592249+00	\N	aal1	\N	\N	node	54.204.124.109	\N	\N	\N	\N	\N
122a1c74-b34c-463d-9402-33eec0658e1b	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 12:47:53.54636+00	2026-03-27 12:47:53.54636+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
6a2867ec-522f-4230-906b-9d131f23e0a1	4facc115-e468-4660-b440-2228132ab9d7	2026-03-27 04:45:25.296871+00	2026-03-27 04:45:25.296871+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
0ae9efd0-ee97-4013-adf7-b1ef6a36260e	4facc115-e468-4660-b440-2228132ab9d7	2026-03-27 04:46:38.748108+00	2026-03-27 04:46:38.748108+00	\N	aal1	\N	\N	node	44.222.132.139	\N	\N	\N	\N	\N
ec4135f6-dd11-4f05-9753-6b426262028a	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 05:08:31.239957+00	2026-03-27 05:08:31.239957+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
37253b71-5da2-4ddd-92bf-c39cba9edc37	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 05:10:55.416454+00	2026-03-27 05:10:55.416454+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
3cfdc86f-2564-442d-a875-d174852e8b74	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 05:12:06.338447+00	2026-03-27 06:10:25.890566+00	\N	aal1	\N	2026-03-27 06:10:25.890465	node	59.88.203.161	\N	\N	\N	\N	\N
1c07d599-6169-427e-9c68-05103d60e12d	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 12:48:52.64746+00	2026-03-27 12:48:52.64746+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
bfc9ad67-8d61-4840-ab35-7fe1d21d003e	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 06:18:08.475423+00	2026-03-27 06:18:08.475423+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
b8fd0c22-ddfd-4847-b6b4-ac53b9c96e0c	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 06:26:18.911332+00	2026-03-27 06:26:18.911332+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
063624cd-2d31-4cb1-8a8f-ddec6f8fa5c9	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 06:26:46.928157+00	2026-03-27 06:26:46.928157+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
d045c5ad-173b-4697-8a7a-461692dcda28	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 06:27:35.492862+00	2026-03-27 06:27:35.492862+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
8e536c1d-cecf-4f17-9893-7b57f2d6bc49	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 06:48:57.98549+00	2026-03-27 06:48:57.98549+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
711a0ce7-cf8c-4ce9-b9fa-098d433e51d8	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 06:55:11.790551+00	2026-03-27 06:55:11.790551+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
afc50ecc-32d4-4efd-b3ac-e16f5d59127a	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-27 12:51:29.64672+00	2026-03-27 12:51:29.64672+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
285f5c0f-f3a8-4d09-8686-137f4bc5777f	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 07:29:44.908366+00	2026-03-27 07:29:44.908366+00	\N	aal1	\N	\N	node	52.4.130.243	\N	\N	\N	\N	\N
b968646c-c409-4a13-909d-4c8f2b6b25a1	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 07:30:40.482324+00	2026-03-27 07:30:40.482324+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
58a683ff-15a0-4aaa-aeab-1b2b920a3821	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-27 07:31:32.849839+00	2026-03-27 07:31:32.849839+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
74992612-bcfc-4e30-b71d-b0960a6b3650	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 07:33:08.567077+00	2026-03-27 07:33:08.567077+00	\N	aal1	\N	\N	node	34.201.146.69	\N	\N	\N	\N	\N
129d39c8-7cec-4e14-80fb-c2702cc82942	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 07:37:30.97821+00	2026-03-27 07:37:30.97821+00	\N	aal1	\N	\N	node	3.92.160.58	\N	\N	\N	\N	\N
c9d792db-7285-4ffa-b6d2-bf11a25d88fe	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 07:37:59.443352+00	2026-03-27 07:37:59.443352+00	\N	aal1	\N	\N	node	34.228.140.177	\N	\N	\N	\N	\N
e957ad90-993e-4f83-93b5-895a25ae85b1	4facc115-e468-4660-b440-2228132ab9d7	2026-03-27 07:41:52.097895+00	2026-03-27 07:41:52.097895+00	\N	aal1	\N	\N	node	34.228.140.177	\N	\N	\N	\N	\N
5694ec71-7ba3-4f26-845e-1b1619fac4e0	4facc115-e468-4660-b440-2228132ab9d7	2026-03-27 07:45:30.13575+00	2026-03-27 07:45:30.13575+00	\N	aal1	\N	\N	node	98.92.86.68	\N	\N	\N	\N	\N
07cc8e6f-a572-426d-9baf-b9347ac3bba5	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 07:49:05.913034+00	2026-03-27 07:49:05.913034+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
ff6a7256-52e1-4ccd-88c3-9c2c856850d1	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 07:49:13.235475+00	2026-03-27 07:49:13.235475+00	\N	aal1	\N	\N	node	54.86.224.48	\N	\N	\N	\N	\N
eff95a3a-ad5f-40bc-8656-ec008d4230e3	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 07:49:38.791762+00	2026-03-27 07:49:38.791762+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
a3bd2908-b034-40e7-a362-3dc02148b2c9	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 06:54:29.573876+00	2026-03-27 10:11:24.032694+00	\N	aal1	\N	2026-03-27 10:11:24.032598	node	59.88.203.161	\N	\N	\N	\N	\N
d7f87781-fda4-4444-8f1e-4a068d072c26	4facc115-e468-4660-b440-2228132ab9d7	2026-03-28 05:27:34.02813+00	2026-03-28 05:27:34.02813+00	\N	aal1	\N	\N	node	103.62.150.11	\N	\N	\N	\N	\N
beff3c5f-f481-4ba1-b326-f17b29738a07	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 10:41:29.458575+00	2026-03-27 10:41:29.458575+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
eeeb3686-bb64-402d-9cc4-c0ad132ba0b1	4facc115-e468-4660-b440-2228132ab9d7	2026-03-27 10:45:12.005002+00	2026-03-27 10:45:12.005002+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
f0a27365-9783-42cd-9aa4-3e22a7aa0394	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-27 10:47:12.846763+00	2026-03-27 10:47:12.846763+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
260c5753-a9e1-4a3c-bcad-d3b7ddecec37	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 11:08:04.078065+00	2026-03-27 11:08:04.078065+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
b2bedb96-9fe3-4012-9c68-e96b8a5bd093	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-27 10:46:07.094527+00	2026-03-27 11:44:32.497972+00	\N	aal1	\N	2026-03-27 11:44:32.49788	node	59.88.203.161	\N	\N	\N	\N	\N
905350a2-995e-4c76-bb3c-4ec18d3f1d13	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-30 04:45:06.943592+00	2026-03-30 05:43:18.7631+00	\N	aal1	\N	2026-03-30 05:43:18.762998	node	59.88.203.161	\N	\N	\N	\N	\N
1ea9bcda-d193-46c9-a6be-babfa55c66f7	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 11:50:21.743227+00	2026-03-27 11:50:21.743227+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
5a15bbbf-2293-496d-a161-af51ab378a3c	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-27 11:50:55.989266+00	2026-03-27 11:50:55.989266+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
b962772a-c49f-407c-93b2-f1df73bdb703	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 11:54:29.679747+00	2026-03-27 11:54:29.679747+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
88a6b041-2710-46fd-80a8-7aec4ca256e2	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 12:14:52.759633+00	2026-03-27 12:14:52.759633+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
828cb6d6-e265-48f4-966e-8108108ff31e	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 12:16:32.512608+00	2026-03-27 12:16:32.512608+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
5799f0db-4910-477c-b2b9-cb3787df542a	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-27 12:16:55.875083+00	2026-03-27 12:16:55.875083+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
602a2e0d-2f63-4a8d-9ebd-5b9be5dcd500	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 12:18:15.569472+00	2026-03-27 12:18:15.569472+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
473cc46c-901b-4d49-a145-0febe23226c9	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 12:29:26.271015+00	2026-03-27 12:29:26.271015+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
29021b23-009b-4fb1-a8ed-cdfddf342a7d	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-27 12:39:33.017388+00	2026-03-27 12:39:33.017388+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
5651804c-c1b2-484f-8aa5-97f5618823f8	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-27 12:45:32.812076+00	2026-03-27 12:45:32.812076+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
188d4b0e-c1dc-4516-acc6-ea30afd1ab85	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-28 06:02:50.824837+00	2026-03-28 07:13:19.001868+00	\N	aal1	\N	2026-03-28 07:13:19.001772	node	103.62.150.11	\N	\N	\N	\N	\N
b87657e6-ef82-4478-91a8-d714ec1b6744	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-30 09:31:24.322948+00	2026-03-30 09:31:24.322948+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
ff52101a-e40e-4cb7-9385-88455c1465ba	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-30 05:04:32.171451+00	2026-03-30 07:01:21.921999+00	\N	aal1	\N	2026-03-30 07:01:21.921903	node	223.181.117.118	\N	\N	\N	\N	\N
c84d7d0b-61de-46ef-aa56-77afac50dbc2	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-30 11:44:16.92693+00	2026-03-30 11:44:16.92693+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
ccb13c8d-9a87-40b8-b221-68cff5753768	4facc115-e468-4660-b440-2228132ab9d7	2026-03-30 09:18:10.385511+00	2026-03-30 09:18:10.385511+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
86cf510b-0a48-4674-bd65-114ff43dcf92	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-30 09:19:27.279745+00	2026-03-30 09:19:27.279745+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
ce262467-24c7-499d-8ac6-da3a25e906f4	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-30 09:30:45.985181+00	2026-03-30 09:30:45.985181+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
82aba822-3b5e-4e69-bcb5-cb5c591db2fb	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-28 11:34:13.128088+00	2026-03-30 04:36:07.376429+00	\N	aal1	\N	2026-03-30 04:36:07.37634	node	59.88.203.161	\N	\N	\N	\N	\N
2080a195-ba47-4612-8942-d8e69d118694	4facc115-e468-4660-b440-2228132ab9d7	2026-03-30 11:47:03.246621+00	2026-03-30 11:47:03.246621+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
a4896750-3e6a-4d2a-bec6-f0b4762fcf00	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-30 11:36:53.265887+00	2026-03-30 11:36:53.265887+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
faebe441-f32d-47c6-b81f-5143f899b1df	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-30 11:54:15.894231+00	2026-03-30 11:54:15.894231+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
e01c7d20-2eb0-4c59-8bd2-b718dbb79435	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-30 11:56:27.70107+00	2026-03-30 11:56:27.70107+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
23ef0a5e-6fc2-4c03-97f3-ec028fb50b34	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-30 11:59:16.442356+00	2026-03-30 11:59:16.442356+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
2d1ac820-6f10-4e7d-a13c-624696157cab	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-30 12:02:47.152621+00	2026-03-30 12:02:47.152621+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
cdfeda14-feeb-4975-b1a4-474e91551186	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-30 12:03:20.006822+00	2026-03-30 12:03:20.006822+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
714702ec-a70d-4809-826c-4476d5503478	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-30 12:20:54.63871+00	2026-03-30 12:20:54.63871+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
e2d0e919-8381-4327-aa0d-4c6602a8d930	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-30 12:21:32.520144+00	2026-03-30 12:21:32.520144+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
f86cba51-11c0-444f-854a-eb9d8d215967	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-30 09:32:37.857813+00	2026-03-30 12:27:29.002819+00	\N	aal1	\N	2026-03-30 12:27:29.002723	node	59.88.203.161	\N	\N	\N	\N	\N
cf4e34c1-a692-4846-803c-54efbea8fbb0	4facc115-e468-4660-b440-2228132ab9d7	2026-03-30 12:31:11.192071+00	2026-03-30 12:31:11.192071+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
aeff1c80-45fb-47aa-9398-226df10a711a	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-31 06:11:24.696828+00	2026-03-31 06:11:24.696828+00	\N	aal1	\N	\N	node	223.181.117.118	\N	\N	\N	\N	\N
54b170ae-bc29-4667-ab92-599295f814a5	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-31 06:15:03.31266+00	2026-03-31 06:15:03.31266+00	\N	aal1	\N	\N	node	223.181.117.118	\N	\N	\N	\N	\N
06805cd3-cce3-4391-a2c8-921013f8bb4a	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 06:15:43.389584+00	2026-03-31 06:15:43.389584+00	\N	aal1	\N	\N	node	223.181.117.118	\N	\N	\N	\N	\N
a4129b7d-2939-43be-9566-bc38cd4544ff	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-31 06:16:09.015549+00	2026-03-31 06:16:09.015549+00	\N	aal1	\N	\N	node	223.181.117.118	\N	\N	\N	\N	\N
dd93361a-cbb1-41e3-92b1-64d44b3e634b	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-06 12:01:47.985355+00	2026-04-06 12:01:47.985355+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
7229a461-997c-4d20-8651-2d9a45cb0642	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-07 05:44:26.367768+00	2026-04-07 05:44:26.367768+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
a292dbe8-92fe-4ded-85a3-f80d8ebf65cd	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-09 09:25:49.827087+00	2026-04-09 11:32:13.089306+00	\N	aal1	\N	2026-04-09 11:32:13.089173	node	59.88.203.161	\N	\N	\N	\N	\N
b3669d3a-6380-4487-93f1-442bedf211aa	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 06:17:06.664992+00	2026-03-31 10:09:36.795371+00	\N	aal1	\N	2026-03-31 10:09:36.795272	node	223.181.117.118	\N	\N	\N	\N	\N
0bcce1fb-90d0-4612-b68d-7204e9419107	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 08:16:40.349774+00	2026-03-31 10:13:09.180571+00	\N	aal1	\N	2026-03-31 10:13:09.180474	node	59.88.203.161	\N	\N	\N	\N	\N
c038385c-078a-4c6e-9090-451edaee8dae	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-07 07:23:32.769493+00	2026-04-07 07:23:32.769493+00	\N	aal1	\N	\N	node	54.81.72.52	\N	\N	\N	\N	\N
9e5d198c-abe7-4707-9b43-f873bc904c51	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-31 10:39:12.137317+00	2026-03-31 10:39:12.137317+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
5d7008f2-5a47-4e1d-89fd-bb23e356dacf	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-31 10:41:24.075116+00	2026-03-31 10:41:24.075116+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
4cdf4ede-6d2c-4026-8e44-3cea4ef464e3	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-03-31 10:42:41.832019+00	2026-03-31 10:42:41.832019+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
f007267f-df66-4073-b305-231c460be44b	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 10:46:23.504736+00	2026-03-31 10:46:23.504736+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
721193d4-6841-44d1-9c6e-5d4ffd1b73b3	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 10:54:08.376665+00	2026-03-31 10:54:08.376665+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
08349095-c457-4849-96c1-6e0c1280eac1	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 11:28:08.255752+00	2026-03-31 11:28:08.255752+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
8a9c23a6-11eb-4bc9-a748-5c76101ef4de	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-03-31 11:33:00.63085+00	2026-03-31 11:33:00.63085+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
1895f912-6cac-443c-a7be-2ec33c2eaab7	4facc115-e468-4660-b440-2228132ab9d7	2026-03-31 11:36:36.327618+00	2026-03-31 11:36:36.327618+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
83268703-7c40-4107-82a7-a967c7526c9e	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-08 09:44:10.377516+00	2026-04-08 09:44:10.377516+00	\N	aal1	\N	\N	node	54.210.10.217	\N	\N	\N	\N	\N
7cb56bda-f645-465b-ba2c-2dc973d87abb	4facc115-e468-4660-b440-2228132ab9d7	2026-03-31 11:40:47.059654+00	2026-03-31 11:40:47.059654+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
4e1c318e-f3b7-4daa-bab6-d088bb55649a	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-03-31 11:41:12.108958+00	2026-03-31 11:41:12.108958+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
e0b692f7-50a5-4905-b404-4e84c4ee54ef	941d29b5-c66f-4f5e-bc75-a1da83842e5b	2026-03-26 09:24:17.773696+00	2026-04-09 09:26:45.835899+00	\N	aal1	\N	2026-04-09 09:26:45.835803	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	59.88.203.161	\N	\N	\N	\N	\N
4b52b854-5579-47c8-871e-bb5b0a50cae9	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-03-31 11:56:01.136988+00	2026-03-31 12:54:07.200815+00	\N	aal1	\N	2026-03-31 12:54:07.200707	node	59.88.203.161	\N	\N	\N	\N	\N
76c0f0d6-1f60-4e80-b263-482898874c18	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-04-01 05:06:34.133122+00	2026-04-01 05:06:34.133122+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
8c0d83dc-9259-42ef-a11a-4a763549c0d8	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 11:41:41.472981+00	2026-04-02 11:41:41.472981+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
f3c2a237-09fe-45bc-a326-490b935ce4d3	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 11:50:34.536992+00	2026-04-02 11:50:34.536992+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
07c5f6c5-0cd1-4116-8423-7e1f797d2998	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 12:05:55.285051+00	2026-04-02 12:05:55.285051+00	\N	aal1	\N	\N	node	223.181.119.149	\N	\N	\N	\N	\N
c9b4ad0f-ee5f-4c39-a7bb-fd5ddbc310cb	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 12:06:29.498709+00	2026-04-02 12:06:29.498709+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
6db7ee20-69ce-424b-a942-932e36bd4672	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 12:08:01.923028+00	2026-04-02 12:08:01.923028+00	\N	aal1	\N	\N	node	34.239.177.128	\N	\N	\N	\N	\N
ed71c346-7a70-4a14-ba36-af2c675f6af4	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 12:08:42.790264+00	2026-04-02 12:08:42.790264+00	\N	aal1	\N	\N	node	34.239.177.128	\N	\N	\N	\N	\N
4cfd132d-d2c4-4362-a7af-cddf20935b6d	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 11:44:07.973715+00	2026-04-02 12:42:33.605214+00	\N	aal1	\N	2026-04-02 12:42:33.605094	node	59.88.203.161	\N	\N	\N	\N	\N
635c96d5-16f0-422c-9120-c309861d1dab	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 12:06:38.477764+00	2026-04-02 13:05:02.622538+00	\N	aal1	\N	2026-04-02 13:05:02.622421	node	223.181.119.149	\N	\N	\N	\N	\N
11a095fb-7039-4ace-8bc1-7bd7c0d8af91	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-02 13:24:08.908633+00	2026-04-02 13:24:08.908633+00	\N	aal1	\N	\N	node	98.81.21.64	\N	\N	\N	\N	\N
743f84a1-0998-4cc8-8f7c-0eebc03c1c0a	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 13:28:52.849949+00	2026-04-02 13:28:52.849949+00	\N	aal1	\N	\N	node	98.86.241.14	\N	\N	\N	\N	\N
e92c1c17-f2fb-407d-a80c-640afc77f5a5	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-02 13:46:22.366158+00	2026-04-02 13:46:22.366158+00	\N	aal1	\N	\N	node	100.53.168.80	\N	\N	\N	\N	\N
8d117774-5aca-4e56-8019-4a2174f204f8	4facc115-e468-4660-b440-2228132ab9d7	2026-04-02 13:47:44.38067+00	2026-04-02 13:47:44.38067+00	\N	aal1	\N	\N	node	100.53.168.80	\N	\N	\N	\N	\N
fa2580eb-6ae8-4487-832f-b76fb377e958	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-03 04:57:11.229913+00	2026-04-03 04:57:11.229913+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
490afe5a-c0a0-4722-932f-46df7f2d72ce	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-04-03 05:07:52.778944+00	2026-04-03 05:07:52.778944+00	\N	aal1	\N	\N	node	32.192.84.85	\N	\N	\N	\N	\N
b3f02c90-8483-44d8-bb08-655591bdbf16	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-04-03 05:08:51.417461+00	2026-04-03 05:08:51.417461+00	\N	aal1	\N	\N	node	32.192.84.85	\N	\N	\N	\N	\N
59cfa726-8cc8-4f00-8b23-39b1bb7060ef	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-03 05:28:18.676153+00	2026-04-03 05:28:18.676153+00	\N	aal1	\N	\N	node	3.88.110.208	\N	\N	\N	\N	\N
35f8f65a-16fc-4ef7-8fee-f410dc4d6ca2	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-03 05:39:35.701902+00	2026-04-03 05:39:35.701902+00	\N	aal1	\N	\N	node	54.174.47.6	\N	\N	\N	\N	\N
d661f81c-6fe8-41ed-ac00-7cd04368be1d	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-03 09:50:50.257662+00	2026-04-03 09:50:50.257662+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
ea4eb1ef-26c1-476e-8a1b-7f5f229292f5	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-04-03 10:28:07.100957+00	2026-04-03 10:28:07.100957+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
c86e399b-910a-47f2-9e57-690b5147795b	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-03 10:32:51.326402+00	2026-04-03 10:32:51.326402+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
56a2da5f-6659-4bec-94b4-78218a851724	4facc115-e468-4660-b440-2228132ab9d7	2026-04-03 10:34:42.979553+00	2026-04-03 10:34:42.979553+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
85148157-35c7-4d35-895a-51fcc087166c	b7271c67-b547-4252-a4df-925b2cdcdebe	2026-04-03 10:35:20.360874+00	2026-04-03 11:33:39.963424+00	\N	aal1	\N	2026-04-03 11:33:39.963326	node	59.88.203.161	\N	\N	\N	\N	\N
d5c9b095-7f28-4e5d-8823-e4a9e0d29b0f	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-04-06 04:20:45.036795+00	2026-04-06 04:20:45.036795+00	\N	aal1	\N	\N	node	3.91.154.92	\N	\N	\N	\N	\N
c7556287-e596-4d0d-b4b6-08e1d7d5ea50	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-06 04:47:12.391605+00	2026-04-06 04:47:12.391605+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
2f93e346-d8b0-40a5-a153-7681276c47bd	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-06 05:39:36.472118+00	2026-04-06 05:39:36.472118+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
90fd47b6-0e1d-4343-83f1-8c21ca2d5c26	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	2026-04-06 06:09:28.403235+00	2026-04-06 06:09:28.403235+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
caea5e55-ec23-4520-9997-16b057ea90a3	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-04-06 06:25:45.782623+00	2026-04-06 06:25:45.782623+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
d1b72642-b7f9-418a-bccd-04bea79c212e	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-06 06:32:01.560022+00	2026-04-06 06:32:01.560022+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
b8d6e757-0a6d-4bd0-88e7-cab95e8e6d4a	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-06 06:38:45.971339+00	2026-04-06 06:38:45.971339+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
6e8f6a87-87ff-42d0-bd74-0b363aaf3f02	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-07 05:48:52.972325+00	2026-04-07 08:43:32.73669+00	\N	aal1	\N	2026-04-07 08:43:32.73612	node	59.88.203.161	\N	\N	\N	\N	\N
ef0a0428-d868-43c7-b18b-5d6f04b1cb4c	4facc115-e468-4660-b440-2228132ab9d7	2026-04-06 06:40:19.582472+00	2026-04-06 08:41:45.948663+00	\N	aal1	\N	2026-04-06 08:41:45.94857	node	59.88.203.161	\N	\N	\N	\N	\N
c6b552bd-7114-4150-bd81-ed5a6c19700b	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-06 11:41:27.248205+00	2026-04-06 11:41:27.248205+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
9afcad15-1003-4bb2-a172-295b7c76f597	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-07 09:06:04.19685+00	2026-04-07 09:06:04.19685+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
904b4d5f-df5a-4857-8d02-b4cb59eef77d	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-07 09:44:39.093536+00	2026-04-07 12:44:40.573543+00	\N	aal1	\N	2026-04-07 12:44:40.573442	node	59.88.203.161	\N	\N	\N	\N	\N
7aa55054-b0d7-42e1-ba12-b23da61efa8e	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-07 13:06:11.245963+00	2026-04-07 13:06:11.245963+00	\N	aal1	\N	\N	node	13.222.176.206	\N	\N	\N	\N	\N
24a8b029-aba0-4821-aa12-226436108f87	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	2026-04-08 06:27:45.66386+00	2026-04-08 06:27:45.66386+00	\N	aal1	\N	\N	node	122.168.69.174	\N	\N	\N	\N	\N
3d7da303-9810-450b-aa50-4357696d2a6b	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-08 09:00:48.75174+00	2026-04-08 09:00:48.75174+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
7a27a9d2-3669-4536-acec-084edf669da5	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-08 09:01:51.816152+00	2026-04-08 09:01:51.816152+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
f7538dc9-96fc-428f-9405-061cf5f3fd25	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-08 09:03:11.768665+00	2026-04-08 09:03:11.768665+00	\N	aal1	\N	\N	node	13.218.120.134	\N	\N	\N	\N	\N
1fbfd54b-1601-4de6-8105-0dc66b51cbbf	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	2026-04-08 09:04:50.629794+00	2026-04-08 09:04:50.629794+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
70d99088-f7c1-446a-a2ba-f79fc26f9504	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-09 06:33:06.268023+00	2026-04-09 08:49:31.530782+00	\N	aal1	\N	2026-04-09 08:49:31.530629	node	59.88.203.161	\N	\N	\N	\N	\N
302811d2-e583-4915-84e4-d83ac6720615	01ce5190-59c2-4df5-9190-fa40b2eacea5	2026-04-09 12:10:44.076969+00	2026-04-09 12:10:44.076969+00	\N	aal1	\N	\N	node	59.88.203.161	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	b7271c67-b547-4252-a4df-925b2cdcdebe	authenticated	authenticated	billing@gmail.com	$2a$10$3kYplVWSXPGDIJbynLHNDOArJOUjzTeAuzRl/YsPr8Rqz0OjT6E3q	2026-04-02 11:39:18.45207+00	\N		\N		\N			\N	2026-04-03 10:35:20.36077+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-02 11:39:18.433971+00	2026-04-03 11:33:39.957971+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	941d29b5-c66f-4f5e-bc75-a1da83842e5b	authenticated	authenticated	kylysyha@forexzig.com	$2a$10$8mQNFJZW3FnwMKzzySHS0./h3bb.7XKHGqXwZM4Ht6G5XvI9lFcaO	2026-03-26 09:24:17.763805+00	2026-03-26 09:23:54.309924+00		\N		\N			\N	2026-03-26 10:37:28.098491+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 09:23:54.283274+00	2026-04-09 09:26:45.832216+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4facc115-e468-4660-b440-2228132ab9d7	authenticated	authenticated	pharmacy@gmail.com	$2a$10$TFilFnWz1BooNprJvfmQ/O7VfkhDTXAOS29jN6Ee/NTv9P90NVOTi	2026-03-26 11:47:38.706671+00	\N		\N		\N			\N	2026-04-06 06:40:19.581533+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 11:47:38.69676+00	2026-04-06 08:41:45.94218+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	authenticated	authenticated	patient@gmail.com	$2a$10$l4xrPF6dnmGhbbU1OJO6PO5MtJ/nSMDqT18Qse8cOgbh5N0h1d.iq	2026-03-26 11:08:57.251684+00	\N		\N		\N			\N	2026-04-09 09:25:49.82699+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 11:08:57.239504+00	2026-04-09 11:32:13.084587+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	01ce5190-59c2-4df5-9190-fa40b2eacea5	authenticated	authenticated	doctor1@gmail.com	$2a$10$tQQc0.0en.iGl.SMDVGm2.XNgdyc9VWnc.3tKlnTLcw/kAYPIrDM6	2026-03-26 11:00:44.755037+00	\N		\N		\N			\N	2026-04-09 12:10:44.069678+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 11:00:44.731257+00	2026-04-09 12:10:44.148386+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	authenticated	authenticated	admin@gmail.com	$2a$10$s3kD0erX9ZmoQGENXqvGtOTl1MZiXsJWUpp6Bw//tFTmoIQsvPHR6	2026-03-26 11:37:23.046182+00	\N		\N		\N			\N	2026-04-06 06:09:28.401695+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 11:37:23.032065+00	2026-04-06 06:09:28.459681+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	572d0b22-e590-4dd6-a64b-19e9a3dbd048	authenticated	authenticated	bonoweso@fxzig.com	$2a$10$HpKXHrX74iCOiPQd.uJTVOwoqBr/3vYERfXg4vvmNMv33A.8qulcC	2026-03-26 09:06:48.925346+00	2026-03-26 09:06:37.09808+00		\N		\N			\N	2026-03-26 09:06:48.930108+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 09:06:37.070639+00	2026-03-26 09:06:48.942351+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	authenticated	authenticated	helpdesk@gmail.com	$2a$10$xRnXQj3XtzfszLigtEZZ2uvEDFG7qYlXFmWzKZ8T7HyXHlHuIXbKO	2026-03-26 11:40:52.841347+00	\N		\N		\N			\N	2026-04-08 06:27:45.663342+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-26 11:40:52.757048+00	2026-04-08 06:27:45.72289+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cc0f9f24-5249-40be-9353-593d673e5cf5	authenticated	authenticated	abhishekgatty0@gmail.com		\N	2026-03-30 06:27:52.391661+00	fc06d31885e3933fbd0192f2c57daea305ab745439db79d5b494a024	2026-03-30 06:27:52.391661+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-03-30 06:27:52.363962+00	2026-03-30 06:27:54.775563+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bbeb504f-0b16-4524-9360-71ce9f055620	authenticated	authenticated	abhishekgatty21@gmail.com		\N	2026-03-30 08:46:53.162127+00	8fc3e7581760a1c0f824336095844f663a2da0789fe4ec756421c2b2	2026-03-30 08:46:53.162127+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "patient", "full_name": "Abhishek abhishek", "patient_id": "17748604115279478"}	\N	2026-03-30 08:46:53.137203+00	2026-03-30 08:46:55.936408+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2893617e-1b73-4a19-9135-a0e7d1c34989	authenticated	authenticated	qaweby@forexzig.com		\N	2026-03-30 06:49:20.823998+00	b7f993952547cec40f31f1203b4a3813133ae2b1fc2719353cb585ea	2026-03-30 06:49:20.823998+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "patient", "full_name": "Alice Johnson", "patient_id": "17748528732532313"}	\N	2026-03-30 06:41:14.227732+00	2026-03-30 06:49:23.538231+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b3a610e3-6290-44b1-9801-dff381ec7fd6	authenticated	authenticated	deeraj@gmail.com		\N	2026-03-30 08:24:04.221442+00	68b24a600cf7baae63a58efdefd7d57b7ba690ac05d5243d946f8a5f	2026-03-30 08:24:04.221442+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "patient", "full_name": "ramesh", "patient_id": "17748590423524815"}	\N	2026-03-30 08:24:04.181095+00	2026-03-30 08:24:07.031011+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a904610b-5ebe-4cce-b6c9-83002ca6e26b	authenticated	authenticated	dishanth@gmail.com		\N	2026-03-31 06:09:36.905912+00	8be9603589d83012e9bfd7154548837a7581a849f5a13e6e03fcd94d	2026-03-31 06:09:36.905912+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"full_name": "dishanth", "patient_id": "17749373412735941"}	\N	2026-03-31 06:09:36.882164+00	2026-03-31 06:09:39.717086+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: admissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admissions (id, patient_id, admission_date, ward_id, room_id, bed_id, reason, diagnosis, status, created_at, updated_at, discharge_date, discharge_id, primary_consultant, consultant_dept, wing) FROM stdin;
5	17744283791605696	2026-03-30	18	\N	79	aaaa	\N	active	2026-04-10 05:16:24.184821	2026-04-10 05:16:24.184821	\N	\N	Doctor User	\N	\N
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, consultation_type, notes, status, created_at, updated_at, consultation_fee, payment_status, payment_method, invoice_number) FROM stdin;
52c2dc75-c966-430b-b3ee-62732d281cbc	\N	2	2026-03-25	09:15	in-person		BOOKED	2026-03-25 11:26:34.465351	2026-03-25 11:26:34.465351	0.00	pending	\N	\N
cbea771c-8a11-41d6-8fab-58e600675309	17744283791605696	5	2026-04-08	16:30	teleconsultation	aa	COMPLETED	2026-04-08 09:59:25.884015	2026-04-08 10:14:53.590641	0.00	pending	\N	\N
d04da05a-6048-4550-9566-c8f6405e283d	1775457247178724	5	2026-04-09	09:30	in-person		BOOKED	2026-04-09 06:33:52.757526	2026-04-09 06:51:21.864977	500.00	paid	Cash	\N
e748afbc-bdb1-4d64-99e7-10806f7f2533	1774507960629672	5	2026-03-26	12:22	in-person	Quick add from schedule	BOOKED	2026-03-26 06:52:40.838349	2026-03-26 06:52:40.838349	0.00	pending	\N	\N
5aec4f82-602d-4396-9ac6-d68dea399ace	1774613975410983	2	2026-03-27	12:00	in-person		BOOKED	2026-03-27 12:19:34.962106	2026-03-27 12:19:34.962106	0.00	pending	\N	\N
9e05c62b-eb04-4a0a-9191-46ac52053fd0	1774595493206139	5	2026-03-31	09:30	in-person	aa	BOOKED	2026-03-31 11:35:01.492991	2026-03-31 11:35:01.492991	0.00	pending	\N	\N
988c4cdf-ebff-4ef2-be6a-ff3f916b8a3a	1775211940888192	5	2026-04-03	15:55	in-person	Quick add from schedule	BOOKED	2026-04-03 10:25:40.857474	2026-04-03 10:26:47.929874	300.00	pending	\N	\N
40e72541-8756-4a8a-ab83-e518a0f3da97	1774595648456876	5	2026-04-06	09:30	in-person	aa	BOOKED	2026-04-06 06:33:36.132067	2026-04-06 06:33:36.132067	0.00	pending	\N	\N
057240f5-624e-4f50-a067-4e705d9748f5	1775457247178724	5	2026-04-06	12:04	in-person	Quick add from schedule	BOOKED	2026-04-06 06:34:08.121395	2026-04-06 06:34:08.121395	0.00	pending	\N	\N
0658ec0b-9b25-4870-81c2-fcc6496b8243	1775457247178724	5	2026-04-07	10:30	teleconsultation	aa	COMPLETED	2026-04-07 09:25:37.416912	2026-04-07 09:29:32.235606	0.00	pending	\N	\N
330f4644-b6b5-472f-8c6a-0848477a30b1	1775211940888192	5	2026-04-08	14:30	teleconsultation		BOOKED	2026-04-08 09:02:15.448907	2026-04-08 09:02:15.448907	0.00	pending	\N	\N
\.


--
-- Data for Name: beds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beds (id, ward_id, room_id, bed_number, type, floor_number, status, patient_category, attributes, is_active, created_at, updated_at, occupied_by, occupied_at) FROM stdin;
79	18	\N	ICU-02	ICU	9	occupied	Mixed	{}	t	2026-04-06 10:21:06.541989	2026-04-10 05:16:24.184821	17744283791605696	2026-04-10 05:16:24.184821
46	11	\N	Bed-1	VIP	1	available	Mixed	{"room_number": "a-1", "currentPatient": null, "patientHistory": [{"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 65}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 65}, {"name": "Unknown", "patientId": "17750471188568803", "transferDate": "2026-04-01", "transferredFrom": 65}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17750471188568803", "transferDate": "2026-04-01", "transferredTo": 68}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 70}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 50}, {"mrn": "aa", "name": "aa", "patientId": "ADM-1775120679552-599", "admissionDate": "2026-04-02", "dischargeDate": null}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredTo": 62}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 52}, {"name": "aa", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 69}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 48}]}	t	2026-04-01 10:16:36.302105	2026-04-06 06:16:42.615124	\N	\N
48	11	\N	Bed-3	VIP	1	available	Mixed	{"room_number": "a-1", "currentPatient": null, "patientHistory": [{"name": "aa", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 46}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 68}]}	t	2026-04-01 10:16:36.61089	2026-04-06 06:16:54.286629	\N	\N
61	12	\N	Bed-11	General	1	available	Mixed	{"lastDischarge": {"date": "2026-04-02", "notes": "aaa", "patient": {"id": "ADM-1775111648464-994", "age": null, "mrn": "aaa", "name": "prem", "gender": "M", "contact": null, "diagnosis": "aaa", "admissionDate": "2026-04-02", "estimatedDischarge": "2026-04-09", "specialRequirements": null}}, "currentPatient": null, "patientHistory": [{"name": "Unknown", "reason": "Clinical transfer", "patientId": "17751040520428300", "transferDate": "2026-04-02", "transferredTo": 55}, {"mrn": "aaa", "name": "prem", "notes": "aaa", "patientId": "ADM-1775111648464-994", "admissionDate": "2026-04-02", "dischargeDate": "2026-04-02"}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 60}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 62}]}	t	2026-04-01 10:47:12.117093	2026-04-06 06:23:39.353787	\N	\N
76	17	\N	A-101	General	9	available	Mixed	{"room_number": "101"}	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	\N	\N
77	17	\N	A-102	General	9	available	Mixed	{"room_number": "102"}	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	\N	\N
78	18	\N	ICU-01	ICU	9	available	Mixed	{}	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	\N	\N
80	19	\N	P-101	Pediatric	10	available	Children	{"room_number": "P1"}	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	\N	\N
51	12	\N	Bed-1	General	1	available	Mixed	{"room_number": "class -b", "lastDischarge": {"date": "2026-04-07", "notes": "", "patientId": "17744283791605696"}, "currentPatient": {"id": "17744283791605696", "name": "aa", "transferDate": "2026-04-06", "transferReason": "Clinical transfer", "transferredFrom": 63}, "patientHistory": [{"name": "Unknown", "notes": "a", "patientId": "17744283791605696", "transferDate": "2026-04-01", "dischargeDate": "2026-04-02", "transferredFrom": 63}, {"name": "Unknown", "notes": "a", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "dischargeDate": "2026-04-02", "transferredTo": 60}, {"name": "Unknown", "notes": "a", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "dischargeDate": "2026-04-02", "transferredTo": 62}, {"name": "Unknown", "notes": "a", "patientId": "17744283791605696", "transferDate": "2026-04-02", "dischargeDate": "2026-04-02", "transferredFrom": 50}, {"name": "aa", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredFrom": 70}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 69}, {"name": "aa", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 63}]}	t	2026-04-01 10:17:18.201481	2026-04-07 07:16:53.222769	\N	\N
66	13	\N	new-1	General	5	occupied	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 59}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 70}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 60}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 63}]}	t	2026-04-01 11:39:06.986669	2026-04-09 10:54:07.677545	17757320477114954	2026-04-09 10:54:07.677545
56	12	\N	Bed-6	General	1	available	Mixed	{}	t	2026-04-01 10:47:11.343263	2026-04-06 05:20:15.02705	\N	\N
58	12	\N	Bed-8	General	1	available	Mixed	{}	t	2026-04-01 10:47:11.655067	2026-04-06 05:20:15.02705	\N	\N
53	12	\N	Bed-3	General	1	available	Mixed	{"room_number": "class -b"}	t	2026-04-01 10:17:18.50258	2026-04-06 05:20:15.02705	\N	\N
54	12	\N	Bed-4	General	1	available	Mixed	{"room_number": "class -b"}	t	2026-04-01 10:17:18.653935	2026-04-06 05:20:15.02705	\N	\N
67	13	\N	new-2	General	5	available	Mixed	{}	t	2026-04-01 11:39:07.140613	2026-04-06 05:20:15.02705	\N	\N
52	12	\N	Bed-2	General	1	available	Mixed	{"room_number": "class -b", "currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 46}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 70}]}	t	2026-04-01 10:17:18.353035	2026-04-06 05:20:15.02705	\N	\N
64	12	\N	Bed-14	General	1	available	Mixed	{"currentPatient": {"id": "17744283791605696", "name": "Unknown", "transferDate": "2026-04-06", "transferReason": "Clinical transfer", "transferredFrom": 70}, "patientHistory": [{"name": "Unknown", "patientId": "17750471188568803", "transferDate": "2026-04-01", "transferredFrom": 68}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17750471188568803", "transferDate": "2026-04-02", "transferredTo": 50}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 70}]}	t	2026-04-01 10:47:12.580446	2026-04-06 05:20:15.02705	\N	\N
70	13	\N	new-5	General	5	available	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 66}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 47}, {"name": "Unknown", "patientId": "17750471188568803", "transferDate": "2026-04-02", "transferredFrom": 50}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 46}, {"name": "aa", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredFrom": 65}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredTo": 51}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 52}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 64}]}	t	2026-04-01 11:39:07.599396	2026-04-06 05:20:15.02705	\N	\N
81	20	\N	A-101	General	11	available	Mixed	{"room_number": "101"}	t	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324	\N	\N
82	21	\N	A-102	General	12	available	Mixed	{"room_number": "102"}	t	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324	\N	\N
83	22	\N	ICU-01	ICU	13	available	Mixed	{}	t	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324	\N	\N
65	12	\N	Bed-15	General	1	available	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 46}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 46}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 57}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17750471188568803", "transferDate": "2026-04-01", "transferredTo": 46}, {"name": "aa", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredFrom": 62}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredTo": 70}]}	t	2026-04-01 10:47:12.733556	2026-04-06 05:20:15.02705	\N	\N
60	12	\N	Bed-10	General	1	available	Mixed	{"lastDischarge": {"date": "2026-04-02", "notes": "", "patientId": "17744283791605696"}, "currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 51}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 49}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 66}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 61}]}	t	2026-04-01 10:47:11.962848	2026-04-06 06:23:38.495057	\N	\N
50	11	\N	Bed-5	VIP	1	available	Mixed	{"room_number": "a-1", "currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17750471188568803", "transferDate": "2026-04-02", "transferredFrom": 64}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17750471188568803", "transferDate": "2026-04-02", "transferredTo": 70}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 46}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 51}]}	t	2026-04-01 10:16:36.91709	2026-04-06 05:20:15.02705	\N	\N
62	12	\N	Bed-12	General	1	available	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 51}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 59}, {"name": "aa", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredFrom": 46}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17745156416707203", "transferDate": "2026-04-02", "transferredTo": 65}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 61}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-09", "transferredTo": 63}]}	t	2026-04-01 10:47:12.270582	2026-04-09 05:50:52.708343	\N	\N
68	13	\N	new-3	General	5	available	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17750471188568803", "transferDate": "2026-04-01", "transferredFrom": 46}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17750471188568803", "transferDate": "2026-04-01", "transferredTo": 64}, {"name": "aa", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 48}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 63}]}	t	2026-04-01 11:39:07.294001	2026-04-06 06:16:44.772433	\N	\N
47	11	\N	Bed-2	VIP	1	available	Mixed	{"room_number": "a-1", "currentPatient": {"id": "17744283791605696", "name": "Unknown", "transferDate": "2026-04-02", "transferReason": "Clinical transfer", "transferredFrom": 69}, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 70}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 69}]}	t	2026-04-01 10:16:36.452885	2026-04-06 05:20:15.02705	\N	\N
59	12	\N	Bed-9	General	1	available	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 62}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 66}]}	t	2026-04-01 10:47:11.807814	2026-04-06 05:20:15.02705	\N	\N
55	12	\N	Bed-5	General	1	available	Mixed	{"room_number": "class -b", "currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17751040520428300", "transferDate": "2026-04-02", "transferredFrom": 61}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17751040520428300", "transferDate": "2026-04-02", "transferredTo": 69}]}	t	2026-04-01 10:17:18.803516	2026-04-06 05:20:15.02705	\N	\N
49	11	\N	Bed-4	VIP	1	available	Mixed	{"room_number": "a-1", "currentPatient": {"id": "17744283791605696", "name": "Unknown", "transferDate": "2026-04-01", "transferReason": "Clinical transfer", "transferredFrom": 60}, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 60}]}	t	2026-04-01 10:16:36.764515	2026-04-06 05:20:15.02705	\N	\N
69	13	\N	new-4	General	5	available	Mixed	{"currentPatient": null, "patientHistory": [{"name": "Unknown", "patientId": "17751040520428300", "transferDate": "2026-04-02", "transferredFrom": 55}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 63}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 47}, {"name": "aa", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 51}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 46}]}	t	2026-04-01 11:39:07.447419	2026-04-06 06:16:45.996314	\N	\N
63	12	\N	Bed-13	General	1	occupied	Mixed	{"lastDischarge": {"date": "2026-04-02", "notes": "aaa", "patient": {"id": "ADM-1775120400612-419", "age": null, "mrn": "aa", "name": "prem", "gender": "M", "contact": null, "diagnosis": "aaa", "admissionDate": "2026-04-02", "estimatedDischarge": "2026-04-09", "specialRequirements": null}}, "currentPatient": {"id": "17744283791605696", "name": "Unknown", "transferDate": "2026-04-09", "transferReason": "Clinical transfer", "transferredFrom": 62}, "patientHistory": [{"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredTo": 51}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredFrom": 66}, {"name": "Unknown", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-02", "transferredTo": 69}, {"mrn": "aa", "name": "prem", "notes": "aaa", "patientId": "ADM-1775120400612-419", "admissionDate": "2026-04-02", "dischargeDate": "2026-04-02"}, {"name": "aa", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredFrom": 68}, {"name": "aa", "reason": "Clinical transfer", "patientId": "17744283791605696", "transferDate": "2026-04-06", "transferredTo": 51}, {"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-09", "transferredFrom": 62}]}	t	2026-04-01 10:47:12.424908	2026-04-09 05:45:53.896393	17744283791605696	2026-04-09 05:45:53.896393
57	12	\N	Bed-7	General	1	available	Mixed	{"currentPatient": {"id": "17744283791605696", "name": "Unknown", "transferDate": "2026-04-01", "transferReason": "Clinical transfer", "transferredFrom": 65}, "patientHistory": [{"name": "Unknown", "patientId": "17744283791605696", "transferDate": "2026-04-01", "transferredFrom": 65}]}	t	2026-04-01 10:47:11.503463	2026-04-06 05:20:15.02705	\N	\N
74	15	\N	ICU-02	ICU	7	available	Mixed	{}	t	2026-04-06 09:24:15.206391	2026-04-06 09:24:15.206391	\N	\N
75	16	\N	P-101	Pediatric	6	available	Children	{"room_number": "P1"}	t	2026-04-06 09:24:15.206391	2026-04-06 09:24:15.206391	\N	\N
71	14	\N	A-101	General	7	available	Mixed	{"room_number": "101"}	t	2026-04-06 09:24:15.206391	2026-04-06 10:19:21.272591	\N	\N
72	14	\N	A-102	General	7	available	Mixed	{"room_number": "102"}	t	2026-04-06 09:24:15.206391	2026-04-06 10:19:21.272591	\N	\N
73	15	\N	ICU-01	ICU	7	available	Mixed	{}	t	2026-04-06 09:24:15.206391	2026-04-06 10:19:21.272591	\N	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, description, created_at) FROM stdin;
1	Cardiology Department	\N	2026-03-22 06:58:41.849288
2	Neurology Department	\N	2026-03-22 06:58:41.849288
3	Pediatrics Department	\N	2026-03-22 06:58:41.849288
4	Surgery Department	\N	2026-03-22 06:58:41.849288
5	Emergency Department	\N	2026-03-22 06:58:41.849288
6	Intensive Care Unit	\N	2026-03-22 06:58:41.849288
7	Diagnostics	\N	2026-03-22 06:58:41.849288
8	Oncology Center	\N	2026-03-22 06:58:41.849288
9	Orthopedics Center	\N	2026-03-22 06:58:41.849288
10	Psychiatry Department	\N	2026-03-22 06:58:41.849288
11	Ophthalmology Department	\N	2026-03-22 06:58:41.849288
12	Internal Medicine Department	\N	2026-03-22 06:58:41.849288
\.


--
-- Data for Name: doctor_availability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_availability (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, created_at) FROM stdin;
12	2	1	09:00:00	17:00:00	60	2026-03-27 11:01:16.786261
13	2	2	09:00:00	17:00:00	60	2026-03-27 11:01:16.786261
14	2	3	09:00:00	17:00:00	60	2026-03-27 11:01:16.786261
15	2	4	09:00:00	17:00:00	60	2026-03-27 11:01:16.786261
16	2	5	09:00:00	17:00:00	60	2026-03-27 11:01:16.786261
17	2	0	09:00:00	17:00:00	60	2026-03-27 11:01:16.786261
30	1	0	09:00:00	17:00:00	60	2026-03-27 11:03:53.896394
31	1	1	09:00:00	17:00:00	60	2026-03-27 11:03:53.896394
32	1	2	09:00:00	17:00:00	60	2026-03-27 11:03:53.896394
33	1	3	09:00:00	17:00:00	60	2026-03-27 11:03:53.896394
34	1	4	09:00:00	17:00:00	60	2026-03-27 11:03:53.896394
35	1	5	09:00:00	17:00:00	60	2026-03-27 11:03:53.896394
36	5	0	09:00:00	19:00:00	15	2026-03-30 09:31:50.982419
37	5	1	09:00:00	17:00:00	30	2026-03-30 09:31:50.982419
38	5	2	09:00:00	17:00:00	30	2026-03-30 09:31:50.982419
39	5	3	09:00:00	17:00:00	30	2026-03-30 09:31:50.982419
40	5	4	09:00:00	17:00:00	30	2026-03-30 09:31:50.982419
41	5	5	09:00:00	17:00:00	30	2026-03-30 09:31:50.982419
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctors (id, first_name, last_name, email, phone, specialty, department, license_number, date_of_birth, date_joined, address, city, state, zip_code, country, qualifications, experience, bio, status, avatar, created_at, updated_at) FROM stdin;
1	textdoctor	textdoctor	doctor@gmail.com	+918088197955	Emergency Medicine	Oncology Center	1111111111	1997-02-06	2026-03-25	manglore univercity	manglore	Karnataka	575017	India	["aaa"]	5	aaa	active	\N	2026-03-25 07:36:07.826151	2026-03-25 07:36:07.826151
2	doctor	docot	doctor@example.com	+918088197955	Emergency Medicine	Neurology Department	11111	1999-02-05	2026-03-19	manglore univercity	manglore	Karnataka	575017	India	["MD"]	3	aaa	active	\N	2026-03-25 10:02:12.187703	2026-03-25 10:02:12.187703
5	Doctor	User	doctor1@gmail.com	+1234567890	General Practice	Primary Care	LIC123456	1980-01-01	2026-03-25	123 Health St	Metropolis	State	12345	Country	[]	5	Experienced doctor.	active	\N	2026-03-25 12:13:03.940706	2026-03-25 12:13:03.940706
9	mahesh	g	mahesh@gmail.com	+918088197955	Cardiology	Emergency Department	11	1998-02-20	2026-03-28	manglore univercity	manglore	Karnataka	575017	India	["11"]	1	aaa	active	\N	2026-03-28 07:36:04.704669	2026-03-28 07:36:04.704669
13	John	Doe	john.doe@gmail.com	+1234567890	Cardiology	Cardiology Department	MED12345	1980-05-15	2023-01-10	123 Main St	Springfield	IL	62701	USA	["MD", "FACC"]	15	Experienced cardiologist.	active	\N	2026-03-30 12:06:02.673276	2026-03-30 12:06:02.673276
15	John	Doe	john.doe@example.com	+1234567890	Cardiology	Cardiology Department	MED123456	1980-05-15	2023-01-10	123 Main St	Springfield	IL	62701	USA	["MD", "FACC"]	15	Experienced cardiologist with focus on interventional cardiology.	active	\N	2026-03-30 12:13:19.931483	2026-03-30 12:13:19.931483
16	Sarah	Johnson	sarah.johnson@example.com	+1987654321	Pediatrics	Pediatric Department	PED67890	1985-08-22	2022-06-01	456 Oak Ave	Brookline	MA	02445	USA	["MD", "FAAP"]	10	Board-certified pediatrician specializing in adolescent medicine.	active	\N	2026-03-30 12:13:19.931483	2026-03-30 12:13:19.931483
17	Michael	Chen	michael.chen@example.com	+1122334455	Neurology	Neurology Department	NEU54321	1978-11-02	2024-01-15	789 Pine Rd	Palo Alto	CA	94301	USA	["MD", "PhD", "FAAN"]	18	Neurologist with expertise in stroke and movement disorders.	on-leave	\N	2026-03-30 12:13:19.931483	2026-03-30 12:13:19.931483
\.


--
-- Data for Name: emergency_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.emergency_contacts (id, patient_id, name, relation, phone, created_at, updated_at) FROM stdin;
10	17748533598049564	Bob Johnson	Brother	9988776654	2026-03-30 06:49:19.777519	2026-03-30 06:49:19.777519
11	17748590423524815	Abhishek abhishek	aaaaa	08088197955	2026-03-30 08:24:02.521859	2026-03-30 08:24:02.521859
14	17748604115279478	Abhishek abhishek	aa	08088197955	2026-03-30 08:46:51.671276	2026-03-30 08:46:51.671276
18	17748608322073676	Abhishek abhishek	aa	08088197955	2026-03-30 08:53:52.343807	2026-03-30 08:53:52.343807
19	17748612857418331	Abhishek abhishek	aaaaa	08088197955	2026-03-30 09:01:25.867514	2026-03-30 09:01:25.867514
20	17748614253211267	sathyajith poojary	aaaaa	09995014032	2026-03-30 09:03:45.446578	2026-03-30 09:03:45.446578
22	17749407793480268	Abhishek abhishek	aaaaa	08088197955	2026-03-31 07:06:19.32673	2026-03-31 07:06:19.32673
23	17750471188568803	Abhishek abhishek	aaaaa	08088197955	2026-04-01 12:38:39.088699	2026-04-01 12:38:39.088699
24	17751040520428300	Abhishek 	aaaaa	08088197955	2026-04-02 04:27:31.949595	2026-04-02 04:27:31.949595
25	17751066074143450	Abhishek abhishek	aa	08088197955	2026-04-02 05:10:07.343267	2026-04-02 05:10:07.343267
26	17751075916120621	Abhishek abhishek	aaaaa	08088197955	2026-04-02 05:26:31.520226	2026-04-02 05:26:31.520226
27	17757320477114954	Abhishek abhishek	aaaaa	08088197955	2026-04-09 10:54:07.677545	2026-04-09 10:54:07.677545
\.


--
-- Data for Name: floors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.floors (id, floor_number, name, created_at, updated_at) FROM stdin;
8	1	\N	2026-04-01 10:15:55.661011	2026-04-01 10:15:55.661011
9	5	aa	2026-04-01 11:38:43.673543	2026-04-01 11:38:43.673543
15	6	First Floor	2026-04-06 09:24:15.206391	2026-04-06 09:24:15.206391
14	7	Floor 7	2026-04-06 09:24:15.206391	2026-04-06 10:19:21.272591
17	9	Ground Floor	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989
18	10	First Floor	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989
19	11	Floor 11	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324
20	12	Floor 12	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324
21	13	Floor 13	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324
\.


--
-- Data for Name: insurance_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.insurance_details (id, patient_id, insurance_provider, policy_number, valid_until, group_id, created_at, updated_at) FROM stdin;
11	17745159775106248	HDFC Ergo	1111	2026-03-29	1111	2026-03-26 09:06:35.303799	2026-03-26 09:06:35.303799
12	17745170159952923	HDFC Ergo	11111	2026-03-30	aaaa	2026-03-26 09:23:52.527311	2026-03-26 09:23:52.527311
22	17748731418376019	LIC	POL12345	2025-12-31	GRP001	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521
23	17748731424734567	Star Health	POL67890	2026-03-20	GRP002	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521
24	17748731431016649	HDFC Ergo	POL11223	2024-09-15	GRP003	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521
25	17749373412735941	LIC of India	\N	2026-04-10	\N	2026-03-31 06:09:34.388498	2026-03-31 06:09:34.388498
4	17744283791605696	HDFC Ergo	11111	2031-02-06	111	2026-03-25 08:46:41.122862	2026-04-09 05:40:41.503908
\.


--
-- Data for Name: ip_bill_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ip_bill_items (id, bill_id, medicine_name, quantity, unit_price, total_price, sale_item_id, created_at) FROM stdin;
36	17	Room Rent – ICU	12	2000.00	24000.00	\N	2026-04-10 05:20:54.538062
37	17	URINE	1	500.00	500.00	\N	2026-04-10 05:20:54.685127
38	17	sugar	1	500.00	500.00	\N	2026-04-10 05:20:54.831875
\.


--
-- Data for Name: ip_bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ip_bills (id, sale_id, patient_id, admission_id, bill_number, total_amount, paid_amount, status, created_at, updated_at) FROM stdin;
17	\N	17744283791605696	5	IP-1775798185549-5	25000.00	0.00	UNPAID	2026-04-10 05:16:25.678649	2026-04-10 05:20:55.267733
\.


--
-- Data for Name: ip_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ip_payments (id, bill_id, amount, payment_method, transaction_id, payment_date) FROM stdin;
\.


--
-- Data for Name: lab_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_orders (id, order_id, patient_id, patient_name, visit_type, visit_id, tests, total_amount, status, order_date, collected_date, completed_date, billing_entry_id, results, created_at, admission_id, admission_date, ward_id, bed_id) FROM stdin;
de58af82-c6bf-4193-9ff3-caec55de07d7	LAB-2026-093	17744283791605696	patient	IP	IP-5	[{"id": "07fe594a-896d-4caf-9201-2578c164a6a8", "name": "URINE", "price": 500}, {"id": "5b7b31c9-6f38-4274-84a8-020cb3c1135f", "name": "sugar", "price": 500}]	1000	Completed	2026-04-10	2026-04-10	2026-04-10	BILL-1775798436505	[{"result": "aa", "test_id": "07fe594a-896d-4caf-9201-2578c164a6a8", "entered_at": "2026-04-10T05:20:48.131Z"}, {"result": "aa", "test_id": "5b7b31c9-6f38-4274-84a8-020cb3c1135f", "entered_at": "2026-04-10T05:20:48.131Z"}]	2026-04-10 05:20:36.81653	5	2026-03-30	18	79
9380c9cf-0879-4a16-8d3f-f63d3a87b5c1	LAB-2026-854	17744283791605696	patient	IP	IP-5	[{"id": "07fe594a-896d-4caf-9201-2578c164a6a8", "name": "URINE", "price": 500}, {"id": "5b7b31c9-6f38-4274-84a8-020cb3c1135f", "name": "sugar", "price": 500}]	1000	Completed	2026-04-10	2026-04-10	2026-04-10	BILL-1775798276572	[{"result": "NORMAL", "test_id": "07fe594a-896d-4caf-9201-2578c164a6a8", "entered_at": "2026-04-10T05:18:16.853Z"}, {"result": "NORMAL", "test_id": "5b7b31c9-6f38-4274-84a8-020cb3c1135f", "entered_at": "2026-04-10T05:18:16.853Z"}]	2026-04-10 05:17:56.829	\N	\N	\N	\N
\.


--
-- Data for Name: lab_tests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_tests (id, test_name, test_code, category, price, active, created_at) FROM stdin;
5b7b31c9-6f38-4274-84a8-020cb3c1135f	sugar	CBC001	Blood	500	t	2026-04-10 05:17:11.389027
07fe594a-896d-4caf-9201-2578c164a6a8	URINE	CBC002	Urine	500	t	2026-04-10 05:17:31.822326
\.


--
-- Data for Name: medical_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_history (id, patient_id, allergy, chronic_condition, medications, created_at) FROM stdin;
9	1774507960629672	aa			2026-03-26 06:52:40.838349
10	17745145005202717	Dust		aa	2026-03-26 08:41:48.785698
11	17745145005202717		Diabetes Type 2	aa	2026-03-26 08:41:48.785698
12	17745150867803767	Dust		aaaaaa	2026-03-26 08:52:08.840358
13	17745150867803767		Diabetes Type 2	aaaaaa	2026-03-26 08:52:08.840358
14	17745156416707203	Dust		aaaa	2026-03-26 09:00:59.952187
15	17745156416707203		Diabetes Type 2	aaaa	2026-03-26 09:00:59.952187
16	17745159775106248	Dust		aaa	2026-03-26 09:06:24.356228
17	17745159775106248		Diabetes Type 2	aaa	2026-03-26 09:06:24.356228
18	17745170159952923	Dust		aaa	2026-03-26 09:23:42.262271
19	17745170159952923		Diabetes Type 2	aaa	2026-03-26 09:23:42.262271
20	17745173950542692	Dust		aaaaa	2026-03-26 09:30:02.853646
21	17745173950542692		Diabetes Type 2	aaaaa	2026-03-26 09:30:02.853646
22	1774595493206139	penclian			2026-03-27 07:11:34.32915
30	17748731418376019	Pollen	Diabetes Type 2	Metformin 500mg daily	2026-03-30 12:19:02.062521
31	17748731424734567	Penicillin	Hypertension	Lisinopril 10mg daily	2026-03-30 12:19:02.062521
32	17748731431016649	Shellfish	Asthma	Inhaler as needed	2026-03-30 12:19:02.062521
33	1775211940888192	aaa			2026-04-03 10:25:40.857474
34	1775457247178724	aaa			2026-04-06 06:34:08.121395
7	17744283791605696	Dust		aaaa	2026-03-25 08:46:26.674218
8	17744283791605696	Dust		aaaa	2026-03-25 08:46:26.674218
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medicines (id, name, generic_name, brand_name, category, unit, purchase_price, selling_price, mrp, tax_percent, is_active, created_at, updated_at, reorder_level) FROM stdin;
1	new	new	new	Cardiovascular	Syrup	100.00	110.00	100.00	1.00	t	2026-03-27 04:52:47.665861	2026-03-27 04:52:47.665861	0
4	Paracetamol	Acetaminophen	Tylenol	Pain Relief	Tablet	50.00	80.00	100.00	18.00	t	2026-03-28 05:55:59.320853	2026-03-28 05:55:59.320853	0
5	Paracetamol	Acetaminophen	Tylenol	Pain Relief	Tablet	50.00	80.00	100.00	18.00	t	2026-03-28 05:56:27.621806	2026-03-28 05:56:27.621806	0
2	Paracetamol 500mg	Acetaminophen	Tylenol	Pain Relief	Tablet	25.00	40.00	45.00	18.00	t	2026-03-28 05:47:25.042879	2026-03-28 05:59:23.862396	0
6	Paracetamol	Acetaminophen	Tylenol	Pain Relief	Tablet	50.00	80.00	100.00	18.00	t	2026-03-28 06:00:06.864817	2026-03-28 06:00:06.864817	0
7	Paracetamol	Acetaminophen	Tylenol	Pain Relief	Tablet	50.00	80.00	100.00	18.00	t	2026-03-28 06:00:24.565137	2026-03-28 06:00:24.565137	0
8	Paracetamol	Acetaminophen	Tylenol	Pain Relief	Tablet	50.00	80.00	100.00	18.00	t	2026-03-28 06:00:39.080936	2026-03-28 06:00:39.080936	0
3	Amoxicillin 250mg	Amoxicillin	Amoxil	Antibiotics	Capsule	50.00	80.00	80.00	12.00	t	2026-03-28 05:47:25.042879	2026-03-31 11:37:02.726636	0
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_resets (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
1	8	bbeb8d16fd1cc5d25edc3450809e6cd6e4379ad03e7e0dbd71f22af01e9f6877	2026-03-25 15:55:42.18	2026-03-25 09:35:21.007459	2026-03-25 09:25:42.491088
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients (patient_id, full_name_en, full_name_hi, dob, gender, address, city, state, country, pincode, phone, email, blood_group, registration_step, created_at, updated_at, added_by_doctor_id) FROM stdin;
1774507960629672	deeraj poojary	\N	1900-01-01	male	Not provided	\N	Unknown	India	000000	08088197955	deeraj@gmail.com	O+	1	2026-03-26 06:52:40.838349	2026-03-26 06:52:40.838349	5
17745145005202717	ravi	ravi	2026-03-25	male	kuthar	manglore	Maharashtra	India	575017	8088197955	bonoweso@fxzig.com	B-	2	2026-03-26 08:41:41.768488	2026-03-26 08:41:48.785698	\N
17745150867803767	ravi 	kumar	2026-03-25	male	kuthar	manglore	Karnataka	India	575017	8088197955	bonoweso@fxzig.com	B+	2	2026-03-26 08:51:28.565595	2026-03-26 08:52:08.840358	\N
17745156416707203	naveen	naveen	2026-03-25	male	kuthar	manglore	Karnataka	India	575017	8088197955	bonoweso@fxzig.com	B+	2	2026-03-26 09:00:42.878449	2026-03-26 09:00:59.952187	\N
17748533598049564	Alice Johnson	\N	1990-03-15	female	789 Pine St	Bangalore	Karnataka	India	560001	9988776655	qaweby@forexzig.com	\N	3	2026-03-30 06:49:19.777519	2026-03-30 06:49:19.777519	\N
17748590423524815	ramesh	\N	2026-03-29	male	manglore univercity	manglore	karnataka	India	575017	+919995014032	deeraj@gmail.com	\N	3	2026-03-30 08:24:02.521859	2026-03-30 08:24:02.521859	\N
17745159775106248	ravi 	poojary	2026-03-25	male	kuthar	manglore	Maharashtra	India	575017	8088197955	bonoweso@fxzig.com	B+	3	2026-03-26 09:06:18.670226	2026-03-26 09:06:35.303799	\N
17745170159952923	sanjay	sanjay	2026-03-25	male	aaaaa	manglore	Uttar Pradesh	India	575017	8088197955	kylysyha@forexzig.com	B+	3	2026-03-26 09:23:37.120268	2026-03-26 09:23:52.527311	\N
17745173950542692	prem	prem	2026-03-25	male	kuthar	manglore	Karnataka	India	575017	8088197955	nyjenylo@denipl.net	B+	2	2026-03-26 09:29:56.168813	2026-03-26 09:30:02.853646	\N
17748604115279478	Abhishek abhishek	\N	2026-03-30	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-03-30 08:46:51.671276	2026-03-30 08:46:51.671276	\N
1774595493206139	shivachandan	\N	2026-03-11	male	Not provided	\N	Unknown	India	000000	7760803967	shiva@gmail.com	O+	1	2026-03-27 07:11:34.32915	2026-03-27 07:11:34.32915	5
1774595648456876	kumar	\N	1900-01-01	female	Not provided	mumbai	Unknown	India	000000	+919901188279	patient1@gmail.com	Unknown	1	2026-03-27 07:14:09.601695	2026-03-27 07:41:07.817409	5
1774613975410983	sakshath	\N	2026-03-27	male	Not provided	\N	Unknown	India	000000	+919901188278	patient2@gmail.com	Unknown	1	2026-03-27 12:19:34.962106	2026-03-27 12:19:34.962106	\N
17748608322073676	Abhishek abhishek	\N	2026-03-30	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty1@gmail.com	\N	3	2026-03-30 08:53:52.343807	2026-03-30 08:53:52.343807	\N
17748612857418331	sathyajith poojary	\N	2026-03-29	male	manglore univercity	manglore	Karnataka	India	575017	+919995014032	sathyajith@gmail.com	\N	3	2026-03-30 09:01:25.867514	2026-03-30 09:01:25.867514	\N
17748614253211267	ravi 	\N	2026-03-25	male	kuthar	manglore	Karnataka	India	575017	8088197955	bonoweso@fxzig.com	\N	3	2026-03-30 09:03:45.446578	2026-03-30 09:03:45.446578	\N
17748731418376019	Rajesh Kumar	राजेश कुमार	1990-01-01	male	123 Main St	Mumbai	Maharashtra	India	400001	9876543210	rajesh.kumar@example.com	O+	3	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521	\N
17748731424734567	Priya Sharma	प्रिया शर्मा	1985-06-15	female	456 Park Avenue	Delhi	Delhi	India	110001	9876543211	priya.sharma@example.com	B+	3	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521	\N
17748731431016649	Amit Patel	अमित पटेल	1978-11-30	male	789 Lake View	Ahmedabad	Gujarat	India	380001	9876543212	amit.patel@example.com	AB-	3	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521	\N
17749373412735941	dishanth	\N	2003-09-07	male	manglore	manglore	Karnataka	India	574342	7760803967	dishanth@gmail.com	O+	3	2026-03-31 06:09:02.020656	2026-03-31 06:09:34.388498	\N
17749407793480268	Abhishek abhishek	\N	2026-03-30	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-03-31 07:06:19.32673	2026-03-31 07:06:19.32673	\N
17750471188568803	Abhishek abhishek	\N	2026-04-10	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-04-01 12:38:39.088699	2026-04-01 12:38:39.088699	\N
17751040520428300	ramesh	\N	2026-04-01	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-04-02 04:27:31.949595	2026-04-02 04:27:31.949595	\N
17751066074143450	Abhishek abhishek	\N	2026-04-02	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-04-02 05:10:07.343267	2026-04-02 05:10:07.343267	\N
17751075916120621	Abhishek abhishek	\N	2026-04-02	female	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-04-02 05:26:31.520226	2026-04-02 05:26:31.520226	\N
1775211940888192	Abhishek abhishek	\N	2026-04-03	male	Not provided	\N	Unknown	India	000000	08088197955	abhishekgatty21@gmail.com	O+	1	2026-04-03 10:25:40.857474	2026-04-03 10:25:40.857474	5
1775457247178724	Abhishek abhishek	\N	2026-04-06	male	Not provided	\N	Unknown	India	000000	08088197955	abhishekgatty21@gmail.com	O+	1	2026-04-06 06:34:08.121395	2026-04-06 06:34:08.121395	5
17744283791605696	patient	patient	2004-02-14	male	kuthar	manglore	Karnataka	India	575017	8088197955	patient@gmail.com	A+	3	2026-03-25 08:46:20.347394	2026-04-09 05:40:41.503908	\N
17757320477114954	ravi	\N	2026-04-09	male	manglore univercity	manglore	Karnataka	India	575017	+918088197955	abhishekgatty21@gmail.com	\N	3	2026-04-09 10:54:07.677545	2026-04-09 10:54:07.677545	\N
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prescription_items (id, prescription_id, medicine_id, prescribed_qty, dispensed_qty, instructions, created_at) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prescriptions (id, appointment_id, medication_name, category, dosage, frequency, duration, instructions, recorded_by, created_at) FROM stdin;
5	d04da05a-6048-4550-9566-c8f6405e283d	a	Antibiotic	a	a	a	a	Dr. Sarah Jenkins	2026-04-09 06:39:44.120405
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_items (id, purchase_id, medicine_id, batch_no, expiry_date, quantity, purchase_price, mrp, tax_percent, total, created_at) FROM stdin;
1	5	1	1	2029-05-10	10	100.00	100.00	1.00	1010.00	2026-03-27 04:57:12.081952
2	6	1	2	2027-02-04	100	50.00	50.00	1.00	5050.00	2026-03-31 05:37:21.385253
3	7	3	5	2029-02-09	100	10.00	10.00	1.00	1010.00	2026-03-31 11:37:47.554831
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchases (id, supplier_id, invoice_no, invoice_date, gst_no, payment_mode, subtotal, tax_total, grand_total, is_delivered, stock_updated, created_at, updated_at) FROM stdin;
5	2	1111	2026-03-27	1111	Cash	1000.00	10.00	1010.00	t	t	2026-03-27 04:57:12.081952	2026-03-27 04:57:23.838601
6	2	111	2026-03-31	111	Cash	5000.00	50.00	5050.00	t	t	2026-03-31 05:37:21.385253	2026-03-31 05:37:32.243833
7	2	1	2026-03-31	1	Cash	1000.00	10.00	1010.00	t	t	2026-03-31 11:37:47.554831	2026-03-31 11:37:58.462436
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, patient_id, registration_id, status, completed_at, created_at) FROM stdin;
4	17744283791605696	REG-MN5SUSNI	ACTIVE	2026-03-25 08:46:41.122862	2026-03-25 08:46:41.122862
11	17745159775106248	REG-MN7908V4	ACTIVE	2026-03-26 09:06:35.303799	2026-03-26 09:06:35.303799
12	17745170159952923	REG-MN79MH7N	ACTIVE	2026-03-26 09:23:52.527311	2026-03-26 09:23:52.527311
15	17749373412735941	REG-MNE7VVP6	ACTIVE	2026-03-31 06:09:34.388498	2026-03-31 06:09:34.388498
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, ward_id, room_number, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_items (id, sale_id, medicine_id, batch_no, quantity, unit_price, tax_percent, total, created_at) FROM stdin;
3	2	1	1	1	100.00	0.00	100.00	2026-03-27 05:04:21.40788
5	3	1	1	1	100.00	0.00	100.00	2026-03-31 04:57:11.03118
8	5	1	1	1	100.00	0.10	100.10	2026-03-31 05:03:35.01334
9	4	1	1	1	100.00	0.00	100.00	2026-03-31 05:23:13.263088
11	6	1	2	2	100.00	0.00	200.00	2026-03-31 05:37:43.84606
16	7	1	2	30	100.00	0.00	3000.00	2026-03-31 05:40:55.973303
18	8	1	2	1	100.00	0.00	100.00	2026-03-31 05:56:24.763755
20	9	1	2	1	100.00	0.00	100.00	2026-03-31 10:20:51.245791
23	11	3	5	1	10.00	0.00	10.00	2026-03-31 11:39:08.57145
24	10	1	2	1	100.00	0.00	100.00	2026-03-31 11:39:13.881412
26	12	3	5	1	10.00	0.00	10.00	2026-04-01 08:18:58.410504
28	13	1	2	1	100.00	0.00	100.00	2026-04-01 08:24:00.959259
30	14	3	5	4	10.00	0.00	40.00	2026-04-01 08:27:18.868845
32	15	3	5	1	10.00	0.00	10.00	2026-04-01 08:28:07.060246
34	16	3	5	10	10.00	0.00	100.00	2026-04-01 08:43:51.095117
36	17	1	2	10	100.00	0.00	1000.00	2026-04-01 08:44:50.502609
38	18	3	5	1	10.00	0.00	10.00	2026-04-01 10:45:46.987655
40	19	3	5	1	10.00	0.00	10.00	2026-04-01 11:33:08.718398
42	20	3	5	1	10.00	0.00	10.00	2026-04-02 11:27:45.036128
48	21	3	5	1	10.00	0.00	10.00	2026-04-02 11:32:42.659124
50	22	3	5	5	10.00	0.00	50.00	2026-04-06 05:31:11.502534
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, patient_id, walkin_name, doctor_name, walkin_phone, walkin_address, sale_date, subtotal, tax_total, discount_total, grand_total, payment_mode, created_at, updated_at, prescription_id, stock_updated) FROM stdin;
2	17744283791605696	\N	bbbb	\N	\N	2026-03-27	100.00	0.00	0.00	100.00	Cash	2026-03-27 05:04:02.44298	2026-03-27 05:04:21.40788	\N	t
3	17744283791605696	\N	bbbb	\N	\N	2026-03-30	100.00	0.00	0.00	100.00	Cash	2026-03-30 12:42:55.804885	2026-03-31 04:57:11.03118	\N	t
5	\N	Abhishek abhishek	aaaaa	08088197955	manglore univercity	2026-03-31	100.00	0.10	0.00	100.10	Cash	2026-03-31 05:03:25.712822	2026-03-31 05:03:35.01334	\N	t
4	17744283791605696	\N	aaa	\N	\N	2026-03-31	100.00	0.00	0.00	100.00	Cash	2026-03-31 04:57:47.985925	2026-03-31 05:23:13.263088	\N	t
6	17744283791605696	\N	bbbb	\N	\N	2026-03-31	200.00	0.00	0.00	200.00	Cash	2026-03-31 05:35:51.423288	2026-03-31 05:37:43.84606	\N	t
7	\N	Abhishek abhishek	aaa	08088197955	manglore univercity	2026-03-31	3000.00	0.00	0.00	3000.00	Cash	2026-03-31 05:38:38.648567	2026-03-31 05:40:55.973303	\N	t
8	\N	Abhishek abhishek	aaa	08088197955	manglore univercity	2026-03-31	100.00	0.00	0.00	100.00	Cash	2026-03-31 05:56:18.202089	2026-03-31 05:56:24.763755	\N	t
9	17744283791605696	\N	aaa	\N	\N	2026-03-31	100.00	0.00	0.00	100.00	Cash	2026-03-31 10:20:41.363058	2026-03-31 10:20:51.245791	\N	t
11	17744283791605696	\N	bbbb	\N	\N	2026-03-31	10.00	0.00	0.00	10.00	Cash	2026-03-31 11:38:54.98544	2026-03-31 11:39:08.57145	\N	t
10	17744283791605696	\N	aaa	\N	\N	2026-03-31	100.00	0.00	0.00	100.00	Cash	2026-03-31 10:21:46.749109	2026-03-31 11:39:13.881412	\N	t
12	17744283791605696	\N	aaaa	\N	\N	2026-04-01	10.00	0.00	0.00	10.00	Cash	2026-04-01 08:18:49.901066	2026-04-01 08:18:58.410504	\N	t
13	17744283791605696	\N	bbbb	\N	\N	2026-04-01	100.00	0.00	0.00	100.00	Cash	2026-04-01 08:23:43.162051	2026-04-01 08:24:00.959259	\N	t
14	17744283791605696	\N	bbbb	\N	\N	2026-04-01	40.00	0.00	0.00	40.00	Cash	2026-04-01 08:27:11.752385	2026-04-01 08:27:18.868845	\N	t
15	17744283791605696	\N	aaa	\N	\N	2026-04-01	10.00	0.00	0.00	10.00	Cash	2026-04-01 08:28:01.643836	2026-04-01 08:28:07.060246	\N	t
16	17744283791605696	\N	bbbb	\N	\N	2026-04-01	100.00	0.00	0.00	100.00	Cash	2026-04-01 08:43:43.28171	2026-04-01 08:43:51.095117	\N	t
17	17744283791605696	\N	bbbb	\N	\N	2026-04-01	1000.00	0.00	0.00	1000.00	Cash	2026-04-01 08:44:36.108413	2026-04-01 08:44:50.502609	\N	t
18	17744283791605696	\N	aaa	\N	\N	2026-04-01	10.00	0.00	0.00	10.00	Cash	2026-04-01 10:45:34.447655	2026-04-01 10:45:46.987655	\N	t
19	17744283791605696	\N	bbbb	\N	\N	2026-04-01	10.00	0.00	0.00	10.00	Cash	2026-04-01 11:32:46.642078	2026-04-01 11:33:08.718398	\N	t
20	17744283791605696	\N	aa	\N	\N	2026-04-02	10.00	0.00	0.00	10.00	Cash	2026-04-02 11:27:27.901251	2026-04-02 11:27:45.036128	\N	t
21	17745156416707203	\N	aa	\N	\N	2026-04-02	10.00	0.00	0.00	10.00	Cash	2026-04-02 11:28:05.72326	2026-04-02 11:32:42.659124	\N	t
22	17744283791605696	\N	bbbb	\N	\N	2026-04-06	50.00	0.00	0.00	50.00	Cash	2026-04-06 05:30:27.987953	2026-04-06 05:31:11.502534	\N	t
\.


--
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialties (id, name, description, department, created_at) FROM stdin;
1	Cardiology	\N	Cardiology Department	2026-03-22 06:58:41.849288
2	Neurology	\N	Neurology Department	2026-03-22 06:58:41.849288
3	Pediatrics	\N	Pediatrics Department	2026-03-22 06:58:41.849288
4	Oncology	\N	Oncology Center	2026-03-22 06:58:41.849288
5	Orthopedics	\N	Orthopedics Center	2026-03-22 06:58:41.849288
6	Dermatology	\N	Diagnostics	2026-03-22 06:58:41.849288
7	Psychiatry	\N	Psychiatry Department	2026-03-22 06:58:41.849288
8	Radiology	\N	Diagnostics	2026-03-22 06:58:41.849288
9	Surgery	\N	Surgery Department	2026-03-22 06:58:41.849288
10	Internal Medicine	\N	Internal Medicine Department	2026-03-22 06:58:41.849288
11	Emergency Medicine	\N	Emergency Department	2026-03-22 06:58:41.849288
12	Anesthesiology	\N	Surgery Department	2026-03-22 06:58:41.849288
13	Pathology	\N	Diagnostics	2026-03-22 06:58:41.849288
14	Ophthalmology	\N	Ophthalmology Department	2026-03-22 06:58:41.849288
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock (id, medicine_id, batch_no, expiry_date, quantity, purchase_price, mrp, delivered_manual, created_at, updated_at) FROM stdin;
1	1	1	2029-05-10	1	100.00	100.00	\N	2026-03-27 04:57:23.838601	2026-03-31 05:23:13.263088
2	1	2	2027-02-04	54	50.00	50.00	\N	2026-03-31 05:37:32.243833	2026-04-01 08:44:50.502609
3	3	5	2029-02-09	74	10.00	10.00	\N	2026-03-31 11:37:58.462436	2026-04-06 05:31:11.502534
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_adjustments (id, medicine_id, batch_no, adjustment_type, quantity, reason, previous_quantity, new_quantity, created_by, created_at) FROM stdin;
1	1	1	Damage	5	a	9	4	\N	2026-03-27 05:04:51.719724
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, contact_person, phone, email, address, gst_no, created_at, updated_at) FROM stdin;
2	Default Supplier	Admin	0000000000	supplier@example.com	Address	GST12345	2026-03-27 04:55:14.782468	2026-03-27 04:55:14.782468
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, full_name_en, role, patient_id, created_at, updated_at, doctor_id, auth_user_id, password) FROM stdin;
65	billing@gmail.com	Billing User	billing	\N	2026-04-02 11:37:16.861537	2026-04-02 11:41:42.698593	\N	b7271c67-b547-4252-a4df-925b2cdcdebe	\N
3	doctor@example.com	Doctor Name	doctor	\N	2026-03-22 06:58:41.849288	2026-03-25 12:06:27.564699	3	\N	\N
47	abhishekgatty21@gmail.com	ravi	patient	17757320477114954	2026-03-30 08:46:51.671276	2026-04-09 10:54:07.677545	\N	bbeb504f-0b16-4524-9360-71ce9f055620	$2b$10$kqPQUqKe4R6VOfpXR4cD9uQg270/QD9iVhYRwqU5znUECOrl7mofq
21	kylysyha@forexzig.com	sanjay	patient	17745170159952923	2026-03-26 09:23:52.527311	2026-03-26 09:23:52.527311	\N	941d29b5-c66f-4f5e-bc75-a1da83842e5b	\N
9	doctor1@gmail.com	Doctor User	doctor	\N	2026-03-25 12:16:34.621926	2026-03-26 11:02:24.245931	5	01ce5190-59c2-4df5-9190-fa40b2eacea5	\N
8	patient@gmail.com	patient	patient	17744283791605696	2026-03-25 08:46:41.122862	2026-03-26 11:09:18.123082	\N	6f1eb37e-fe79-4ce0-9149-4fdc451e131a	\N
1	admin@gmail.com	Admin User	admin	\N	2026-03-22 06:58:41.849288	2026-03-26 11:38:59.982386	\N	b2f814fe-8a97-41c6-97ea-5dd4c594f2ae	\N
4	pharmacy@gmail.com	MedPlus Pharmacy	pharmacy	\N	2026-03-22 06:58:41.849288	2026-03-27 04:45:29.811029	\N	4facc115-e468-4660-b440-2228132ab9d7	\N
5	helpdesk@gmail.com	Help Desk Support	helpdesk	\N	2026-03-22 06:58:41.849288	2026-03-27 04:51:28.723071	\N	98aa9e4e-2b92-4c6e-aedf-00ddff4aa1cb	\N
28	mahesh@gmail.com	mahesh g	doctor	\N	2026-03-28 07:36:04.864119	2026-03-28 07:36:04.864119	9	\N	\N
43	qaweby@forexzig.com	Alice Johnson	patient	17748533598049564	2026-03-30 06:49:19.777519	2026-03-30 06:49:19.777519	\N	2893617e-1b73-4a19-9135-a0e7d1c34989	\N
44	deeraj@gmail.com	ramesh	patient	17748590423524815	2026-03-30 08:24:02.521859	2026-03-30 08:24:02.521859	\N	b3a610e3-6290-44b1-9801-dff381ec7fd6	\N
50	abhishekgatty1@gmail.com	Abhishek abhishek	patient	17748608322073676	2026-03-30 08:53:52.343807	2026-03-30 08:53:52.343807	\N	\N	$2b$10$bI80suL8iofHH5tCfS7qFeeW9.YB6pnPPyisQAVdAFak0U3QH6jB2
51	sathyajith@gmail.com	sathyajith poojary	patient	17748612857418331	2026-03-30 09:01:25.867514	2026-03-30 09:01:25.867514	\N	\N	$2b$10$h4tS0NSsoJ/Bf3hqNlNKDO20nWLIRUgjLWQdIhK3lLMLFvimBOHru
20	bonoweso@fxzig.com	ravi 	patient	17748614253211267	2026-03-26 09:06:35.303799	2026-03-30 09:03:45.446578	\N	572d0b22-e590-4dd6-a64b-19e9a3dbd048	$2b$10$AHl9c7XjO7FphV0sAlfuLunn2THi3BOkeU8kuzU3T87LCMVdogySS
55	john.doe@gmail.com	John Doe	doctor	\N	2026-03-30 12:06:02.673276	2026-03-30 12:06:02.673276	13	\N	\N
56	john.doe@example.com	John Doe	doctor	\N	2026-03-30 12:13:19.931483	2026-03-30 12:13:19.931483	15	\N	\N
57	sarah.johnson@example.com	Sarah Johnson	doctor	\N	2026-03-30 12:13:19.931483	2026-03-30 12:13:19.931483	16	\N	\N
58	michael.chen@example.com	Michael Chen	doctor	\N	2026-03-30 12:13:19.931483	2026-03-30 12:13:19.931483	17	\N	\N
61	rajesh.kumar@example.com	Rajesh Kumar	patient	17748731418376019	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521	\N	\N	\N
62	priya.sharma@example.com	Priya Sharma	patient	17748731424734567	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521	\N	\N	\N
63	amit.patel@example.com	Amit Patel	patient	17748731431016649	2026-03-30 12:19:02.062521	2026-03-30 12:19:02.062521	\N	\N	\N
64	dishanth@gmail.com	dishanth	patient	17749373412735941	2026-03-31 06:09:34.388498	2026-03-31 06:09:34.388498	\N	a904610b-5ebe-4cce-b6c9-83002ca6e26b	\N
\.


--
-- Data for Name: visit_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visit_details (id, appointment_id, diagnosis, icd10_code, clinical_notes, follow_up_date, patient_instructions, created_at, updated_at) FROM stdin;
7	988c4cdf-ebff-4ef2-be6a-ff3f916b8a3a	Acute Bronchit	J20.9	aaa	2026-04-03	aaa	2026-04-03 10:26:47.929874	2026-04-03 10:26:47.929874
8	d04da05a-6048-4550-9566-c8f6405e283d	Acute Bronchit	J20.9	aaa	2026-04-09	aa	2026-04-09 06:40:06.366373	2026-04-09 06:40:06.366373
\.


--
-- Data for Name: vitals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vitals (id, appointment_id, bp, hr, temp, weight, rr, spo2, recorded_by, recorded_at) FROM stdin;
5	d04da05a-6048-4550-9566-c8f6405e283d	1	1	1.00	1.00	1	1	Doctor User	2026-04-09 06:34:24.397112
6	d04da05a-6048-4550-9566-c8f6405e283d	2	1	1.00	1.00	\N	2	Doctor User	2026-04-09 06:37:35.116664
\.


--
-- Data for Name: ward_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ward_transfers (id, admission_id, ward_id, from_date, to_date, created_at) FROM stdin;
13	5	18	2026-03-30	\N	2026-04-10 05:16:24.184821
\.


--
-- Data for Name: wards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wards (id, floor_id, name, type, patient_category, description, is_active, created_at, updated_at, daily_rate) FROM stdin;
11	8	class a	VIP	Mixed	\N	t	2026-04-01 10:16:24.060766	2026-04-01 10:16:24.060766	1000.00
12	8	class b	General	Mixed	\N	t	2026-04-01 10:17:06.42398	2026-04-01 10:17:06.42398	100.00
13	9	new	General	Mixed	\N	t	2026-04-01 11:38:55.096366	2026-04-01 11:42:48.913154	1000.00
16	15	Pediatric Ward	Pediatric	Children	\N	t	2026-04-06 09:24:15.206391	2026-04-06 09:24:15.206391	700.00
14	14	General Ward	General	Mixed	\N	t	2026-04-06 09:24:15.206391	2026-04-06 10:19:21.272591	500.00
15	14	ICU	ICU	Mixed	\N	t	2026-04-06 09:24:15.206391	2026-04-06 10:19:21.272591	2000.00
17	17	General Ward	General	Mixed	\N	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	500.00
18	17	ICU	ICU	Mixed	\N	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	2000.00
19	18	Pediatric Ward	Pediatric	Children	\N	t	2026-04-06 10:21:06.541989	2026-04-06 10:21:06.541989	700.00
20	19	General Ward	General	Mixed	\N	t	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324	500.00
21	20	General Ward	General	Mixed	\N	t	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324	500.00
22	21	ICU	ICU	Mixed	\N	t	2026-04-06 10:21:55.00789	2026-04-07 11:05:42.270324	2000.00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-03-22 03:02:05
20211116045059	2026-03-22 03:02:05
20211116050929	2026-03-22 03:02:05
20211116051442	2026-03-22 03:02:05
20211116212300	2026-03-22 03:02:06
20211116213355	2026-03-22 03:02:06
20211116213934	2026-03-22 03:02:06
20211116214523	2026-03-22 03:02:06
20211122062447	2026-03-22 03:02:06
20211124070109	2026-03-22 03:02:06
20211202204204	2026-03-22 03:02:06
20211202204605	2026-03-22 03:02:06
20211210212804	2026-03-22 03:02:06
20211228014915	2026-03-22 03:02:08
20220107221237	2026-03-22 03:02:08
20220228202821	2026-03-22 03:02:08
20220312004840	2026-03-22 03:02:08
20220603231003	2026-03-22 03:02:08
20220603232444	2026-03-22 03:02:08
20220615214548	2026-03-22 03:02:08
20220712093339	2026-03-22 03:02:08
20220908172859	2026-03-22 03:02:08
20220916233421	2026-03-22 03:02:08
20230119133233	2026-03-22 03:02:08
20230128025114	2026-03-22 03:02:08
20230128025212	2026-03-22 03:02:08
20230227211149	2026-03-22 03:02:08
20230228184745	2026-03-22 03:02:08
20230308225145	2026-03-22 03:02:08
20230328144023	2026-03-22 03:02:08
20231018144023	2026-03-22 03:02:08
20231204144023	2026-03-22 03:02:09
20231204144024	2026-03-22 03:02:09
20231204144025	2026-03-22 03:02:09
20240108234812	2026-03-22 03:02:09
20240109165339	2026-03-22 03:02:09
20240227174441	2026-03-22 03:02:09
20240311171622	2026-03-22 03:02:09
20240321100241	2026-03-22 03:02:09
20240401105812	2026-03-22 03:02:09
20240418121054	2026-03-22 03:02:09
20240523004032	2026-03-22 03:02:09
20240618124746	2026-03-22 03:02:09
20240801235015	2026-03-22 03:02:09
20240805133720	2026-03-22 03:02:09
20240827160934	2026-03-22 03:02:09
20240919163303	2026-03-22 03:02:09
20240919163305	2026-03-22 03:02:09
20241019105805	2026-03-22 03:02:09
20241030150047	2026-03-22 03:02:10
20241108114728	2026-03-22 03:02:10
20241121104152	2026-03-22 03:02:10
20241130184212	2026-03-22 03:02:10
20241220035512	2026-03-22 03:02:10
20241220123912	2026-03-22 03:02:10
20241224161212	2026-03-22 03:02:10
20250107150512	2026-03-22 03:02:10
20250110162412	2026-03-22 03:02:10
20250123174212	2026-03-22 03:02:10
20250128220012	2026-03-22 03:02:10
20250506224012	2026-03-22 03:02:10
20250523164012	2026-03-22 03:02:10
20250714121412	2026-03-22 03:02:10
20250905041441	2026-03-22 03:02:10
20251103001201	2026-03-22 03:02:10
20251120212548	2026-03-22 03:02:10
20251120215549	2026-03-22 03:02:10
20260218120000	2026-03-22 03:02:10
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-03-22 03:02:07.170729
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-03-22 03:02:07.270948
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-03-22 03:02:07.310122
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-03-22 03:02:07.930755
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-03-22 03:02:08.293387
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-03-22 03:02:08.305145
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-03-22 03:02:08.340664
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-03-22 03:02:08.347076
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-03-22 03:02:08.354913
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-03-22 03:02:08.36068
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-03-22 03:02:08.366662
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-03-22 03:02:08.372961
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-03-22 03:02:08.387977
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-03-22 03:02:08.393801
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-03-22 03:02:08.399884
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-03-22 03:02:08.827375
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-03-22 03:02:08.834992
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-03-22 03:02:08.840955
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-03-22 03:02:08.846642
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-03-22 03:02:08.882216
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-03-22 03:02:08.888402
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-03-22 03:02:08.92357
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-03-22 03:02:09.053561
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-03-22 03:02:09.143698
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-03-22 03:02:09.149981
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-03-22 03:02:09.155803
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-03-22 03:02:09.172826
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-03-22 03:02:09.178249
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-03-22 03:02:09.183652
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-03-22 03:02:09.189049
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-03-22 03:02:09.194453
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-03-22 03:02:09.206132
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-03-22 03:02:09.211597
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-03-22 03:02:09.217075
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-03-22 03:02:09.222271
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-03-22 03:02:09.227484
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-03-22 03:02:09.237402
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-03-22 03:02:09.242851
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-03-22 03:02:09.262986
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-03-22 03:02:09.295936
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-03-22 03:02:09.301407
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-03-22 03:02:09.30692
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-03-22 03:02:09.312328
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-03-22 03:02:09.317586
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-03-22 03:02:09.32289
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-03-22 03:02:09.332493
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-03-22 03:02:09.417754
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-03-22 03:02:09.423974
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-03-22 03:02:09.429592
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-03-22 03:02:09.768969
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-03-22 03:02:09.775335
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-03-22 06:30:35.102059
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-03-22 06:30:35.104253
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-03-22 06:30:35.11546
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-03-22 06:30:35.117104
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-03-22 06:30:35.118072
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-03-22 06:30:35.128334
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-07 09:23:39.936857
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-07 09:23:39.958261
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 235, true);


--
-- Name: admissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admissions_id_seq', 5, true);


--
-- Name: beds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.beds_id_seq', 83, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 12, true);


--
-- Name: doctor_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_availability_id_seq', 41, true);


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctors_id_seq', 17, true);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.emergency_contacts_id_seq', 27, true);


--
-- Name: floors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.floors_id_seq', 24, true);


--
-- Name: insurance_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.insurance_details_id_seq', 25, true);


--
-- Name: ip_bill_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ip_bill_items_id_seq', 38, true);


--
-- Name: ip_bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ip_bills_id_seq', 20, true);


--
-- Name: ip_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ip_payments_id_seq', 4, true);


--
-- Name: medical_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medical_history_id_seq', 34, true);


--
-- Name: medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medicines_id_seq', 8, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, true);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prescription_items_id_seq', 1, false);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 3, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchases_id_seq', 7, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registrations_id_seq', 15, true);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rooms_id_seq', 2, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 50, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_id_seq', 22, true);


--
-- Name: specialties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.specialties_id_seq', 14, true);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_adjustments_id_seq', 1, true);


--
-- Name: stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_id_seq', 3, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 65, true);


--
-- Name: visit_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.visit_details_id_seq', 8, true);


--
-- Name: visit_prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.visit_prescriptions_id_seq', 5, true);


--
-- Name: vitals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vitals_id_seq', 6, true);


--
-- Name: ward_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ward_transfers_id_seq', 13, true);


--
-- Name: wards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wards_id_seq', 22, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: admissions admissions_discharge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_discharge_id_key UNIQUE (discharge_id);


--
-- Name: admissions admissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: beds beds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_pkey PRIMARY KEY (id);


--
-- Name: beds beds_ward_id_bed_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_ward_id_bed_number_key UNIQUE (ward_id, bed_number);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: doctor_availability doctor_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- Name: doctors doctors_license_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_license_number_key UNIQUE (license_number);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: emergency_contacts emergency_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);


--
-- Name: floors floors_floor_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_floor_number_key UNIQUE (floor_number);


--
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id);


--
-- Name: insurance_details insurance_details_patient_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_details
    ADD CONSTRAINT insurance_details_patient_id_key UNIQUE (patient_id);


--
-- Name: insurance_details insurance_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_details
    ADD CONSTRAINT insurance_details_pkey PRIMARY KEY (id);


--
-- Name: ip_bill_items ip_bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bill_items
    ADD CONSTRAINT ip_bill_items_pkey PRIMARY KEY (id);


--
-- Name: ip_bills ip_bills_bill_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bills
    ADD CONSTRAINT ip_bills_bill_number_key UNIQUE (bill_number);


--
-- Name: ip_bills ip_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bills
    ADD CONSTRAINT ip_bills_pkey PRIMARY KEY (id);


--
-- Name: ip_payments ip_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_payments
    ADD CONSTRAINT ip_payments_pkey PRIMARY KEY (id);


--
-- Name: lab_orders lab_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_pkey PRIMARY KEY (id);


--
-- Name: lab_tests lab_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_tests
    ADD CONSTRAINT lab_tests_pkey PRIMARY KEY (id);


--
-- Name: medical_history medical_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_pkey PRIMARY KEY (id);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_token_key UNIQUE (token);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_invoice_no_key UNIQUE (invoice_no);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_patient_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_patient_id_key UNIQUE (patient_id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_registration_id_key UNIQUE (registration_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_ward_id_room_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_ward_id_room_number_key UNIQUE (ward_id, room_number);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: specialties specialties_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_name_key UNIQUE (name);


--
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock stock_medicine_id_batch_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_medicine_id_batch_no_key UNIQUE (medicine_id, batch_no);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: ip_bills unique_admission_bill; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bills
    ADD CONSTRAINT unique_admission_bill UNIQUE (admission_id);


--
-- Name: admissions unique_discharge_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT unique_discharge_id UNIQUE (discharge_id);


--
-- Name: users users_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_patient_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_patient_id_key UNIQUE (patient_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visit_details visit_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_details
    ADD CONSTRAINT visit_details_pkey PRIMARY KEY (id);


--
-- Name: prescriptions visit_prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT visit_prescriptions_pkey PRIMARY KEY (id);


--
-- Name: vitals vitals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals
    ADD CONSTRAINT vitals_pkey PRIMARY KEY (id);


--
-- Name: ward_transfers ward_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_transfers
    ADD CONSTRAINT ward_transfers_pkey PRIMARY KEY (id);


--
-- Name: wards wards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (appointment_date);


--
-- Name: idx_appointments_doctor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_doctor ON public.appointments USING btree (doctor_id);


--
-- Name: idx_appointments_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_patient ON public.appointments USING btree (patient_id);


--
-- Name: idx_beds_room_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beds_room_id ON public.beds USING btree (room_id);


--
-- Name: idx_beds_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beds_status ON public.beds USING btree (status);


--
-- Name: idx_beds_ward_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beds_ward_id ON public.beds USING btree (ward_id);


--
-- Name: idx_doctors_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_department ON public.doctors USING btree (department);


--
-- Name: idx_doctors_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_email ON public.doctors USING btree (email);


--
-- Name: idx_doctors_license; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_license ON public.doctors USING btree (license_number);


--
-- Name: idx_doctors_specialty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_specialty ON public.doctors USING btree (specialty);


--
-- Name: idx_doctors_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_status ON public.doctors USING btree (status);


--
-- Name: idx_insurance_details_patient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_insurance_details_patient_id ON public.insurance_details USING btree (patient_id);


--
-- Name: idx_medical_history_patient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medical_history_patient_id ON public.medical_history USING btree (patient_id);


--
-- Name: idx_patients_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_city ON public.patients USING btree (city);


--
-- Name: idx_patients_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_email ON public.patients USING btree (email);


--
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- Name: idx_patients_pincode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_pincode ON public.patients USING btree (pincode);


--
-- Name: idx_patients_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_state ON public.patients USING btree (state);


--
-- Name: idx_prescription_items_medicine_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prescription_items_medicine_id ON public.prescription_items USING btree (medicine_id);


--
-- Name: idx_prescription_items_prescription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prescription_items_prescription_id ON public.prescription_items USING btree (prescription_id);


--
-- Name: idx_registrations_patient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_patient_id ON public.registrations USING btree (patient_id);


--
-- Name: idx_registrations_registration_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_registration_id ON public.registrations USING btree (registration_id);


--
-- Name: idx_registrations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_status ON public.registrations USING btree (status);


--
-- Name: idx_rooms_ward_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rooms_ward_id ON public.rooms USING btree (ward_id);


--
-- Name: idx_stock_adjustments_batch_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_adjustments_batch_no ON public.stock_adjustments USING btree (batch_no);


--
-- Name: idx_stock_adjustments_medicine_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_adjustments_medicine_id ON public.stock_adjustments USING btree (medicine_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_patient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_patient_id ON public.users USING btree (patient_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_wards_floor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wards_floor_id ON public.wards USING btree (floor_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: ip_bill_items bill_items_changed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER bill_items_changed AFTER INSERT OR DELETE OR UPDATE ON public.ip_bill_items FOR EACH ROW EXECUTE FUNCTION public.update_bill_total();


--
-- Name: patients generate_patient_id_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER generate_patient_id_trigger BEFORE INSERT ON public.patients FOR EACH ROW WHEN ((new.patient_id IS NULL)) EXECUTE FUNCTION public.generate_patient_id();


--
-- Name: registrations generate_registration_id_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER generate_registration_id_trigger BEFORE INSERT ON public.registrations FOR EACH ROW WHEN ((new.registration_id IS NULL)) EXECUTE FUNCTION public.generate_registration_id();


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: beds update_beds_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON public.beds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: doctors update_doctors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: floors update_floors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON public.floors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: insurance_details update_insurance_details_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_insurance_details_updated_at BEFORE UPDATE ON public.insurance_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: medicines update_medicines_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: patients update_patients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: purchases update_purchases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rooms update_rooms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales update_sales_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stock update_stock_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: suppliers update_suppliers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: visit_details update_visit_details_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_visit_details_updated_at BEFORE UPDATE ON public.visit_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: wards update_wards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON public.wards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admissions admissions_bed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.beds(id);


--
-- Name: admissions admissions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: admissions admissions_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: admissions admissions_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: beds beds_occupied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_occupied_by_fkey FOREIGN KEY (occupied_by) REFERENCES public.patients(patient_id);


--
-- Name: beds beds_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


--
-- Name: beds beds_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: doctor_availability doctor_availability_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: emergency_contacts emergency_contacts_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: insurance_details insurance_details_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_details
    ADD CONSTRAINT insurance_details_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: ip_bill_items ip_bill_items_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bill_items
    ADD CONSTRAINT ip_bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.ip_bills(id) ON DELETE CASCADE;


--
-- Name: ip_bill_items ip_bill_items_sale_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bill_items
    ADD CONSTRAINT ip_bill_items_sale_item_id_fkey FOREIGN KEY (sale_item_id) REFERENCES public.sale_items(id);


--
-- Name: ip_bills ip_bills_admission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bills
    ADD CONSTRAINT ip_bills_admission_id_fkey FOREIGN KEY (admission_id) REFERENCES public.admissions(id);


--
-- Name: ip_bills ip_bills_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_bills
    ADD CONSTRAINT ip_bills_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: ip_payments ip_payments_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_payments
    ADD CONSTRAINT ip_payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.ip_bills(id);


--
-- Name: medical_history medical_history_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: patients patients_added_by_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_added_by_doctor_id_fkey FOREIGN KEY (added_by_doctor_id) REFERENCES public.doctors(id);


--
-- Name: prescription_items prescription_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: purchase_items purchase_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: purchase_items purchase_items_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: registrations registrations_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: rooms rooms_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: sale_items sale_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sales sales_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: stock_adjustments stock_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_adjustments stock_adjustments_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: stock stock_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: visit_details visit_details_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_details
    ADD CONSTRAINT visit_details_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: prescriptions visit_prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT visit_prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: vitals vitals_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals
    ADD CONSTRAINT vitals_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: ward_transfers ward_transfers_admission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_transfers
    ADD CONSTRAINT ward_transfers_admission_id_fkey FOREIGN KEY (admission_id) REFERENCES public.admissions(id);


--
-- Name: ward_transfers ward_transfers_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_transfers
    ADD CONSTRAINT ward_transfers_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: wards wards_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict p7vyXHvomjdvMmlbQKTJPuFpfJlh6yGcmGhMngDvg9XRx3Efpagw2JQBZIhaun4

