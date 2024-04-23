--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: persons; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.persons (
    id integer NOT NULL,
    document_type character varying(3) NOT NULL,
    document character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    age integer NOT NULL,
    transport integer NOT NULL,
    admin integer,
    password character varying(255),
    parent_relationship integer[],
    area character varying(3) NOT NULL,
    guest integer NOT NULL,
    registered_by integer NOT NULL,
    phone character varying(25) NOT NULL,
    birth date
);


ALTER TABLE public.persons OWNER TO "default";

--
-- Name: PERSONAS_ID_seq; Type: SEQUENCE; Schema: public; Owner: default
--

ALTER TABLE public.persons ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."PERSONAS_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.areas (
    id integer NOT NULL,
    name character varying(255),
    abbr character varying(3),
    leader integer[]
);


ALTER TABLE public.areas OWNER TO "default";

--
-- Name: failures; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.failures (
    id integer NOT NULL,
    date timestamp without time zone,
    error character varying(255)
);


ALTER TABLE public.failures OWNER TO "default";

--
-- Name: failures_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

ALTER TABLE public.failures ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.failures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: params; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.params (
    id integer NOT NULL,
    attribute character varying(255),
    value character varying(255)
);


ALTER TABLE public.params OWNER TO "default";

--
-- Name: fees; Type: VIEW; Schema: public; Owner: default
--

CREATE VIEW public.fees AS
 SELECT params.id,
    params.attribute,
    params.value
   FROM public.params
  WHERE (((params.attribute)::text = 'TARIFA_COMPLETA'::text) OR ((params.attribute)::text = 'TARIFA_NINO'::text) OR ((params.attribute)::text = 'TARIFA_BEBE'::text) OR ((params.attribute)::text = 'TARIFA_MENOR'::text) OR ((params.attribute)::text = 'TRANSPORT'::text));


ALTER VIEW public.fees OWNER TO "default";

--
-- Name: table_name_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

ALTER TABLE public.params ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.table_name_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: table_name_id_seq1; Type: SEQUENCE; Schema: public; Owner: default
--

ALTER TABLE public.areas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.table_name_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    value integer NOT NULL,
    authorized integer NOT NULL,
    donation integer NOT NULL,
    "userID" integer NOT NULL,
    confirmed integer NOT NULL
);


ALTER TABLE public.transactions OWNER TO "default";

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO "default";

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: transactionsview; Type: VIEW; Schema: public; Owner: default
--

CREATE VIEW public.transactionsview AS
 SELECT tr.id,
    tr.date,
    tr.value,
    tr."userID",
    tr.confirmed,
    p1.document_type,
    p1.document,
    p1.name,
    p2.id AS authorized,
    p2.name AS authorized_by,
    tr.donation
   FROM ((public.transactions tr
     LEFT JOIN public.persons p1 ON ((tr."userID" = p1.id)))
     LEFT JOIN public.persons p2 ON ((tr.authorized = p2.id)));


ALTER VIEW public.transactionsview OWNER TO "default";

--
-- Name: userview; Type: VIEW; Schema: public; Owner: default
--

CREATE VIEW public.userview AS
 SELECT p.id,
    p.document_type,
    p.document,
    p.name,
    p.age,
    p.birth,
    p.phone,
    p.transport,
    p.admin,
    p.parent_relationship,
    a.name AS area,
    p2.name AS registered,
    p3.name AS invited,
    ( SELECT a.abbr
          WHERE (p.id = ANY (a.leader))) AS leader,
    ( SELECT sum(t.value) AS sum
           FROM public.transactions t
          WHERE (t."userID" = p.id)) AS balance,
    ( SELECT sum(t.value) AS sum
           FROM public.transactions t
          WHERE ((t."userID" = p.id) AND (t.confirmed = 1))) AS confirmed
   FROM (((public.persons p
     JOIN public.areas a ON (((a.abbr)::text = (p.area)::text)))
     LEFT JOIN public.persons p2 ON ((p2.id = p.registered_by)))
     LEFT JOIN public.persons p3 ON ((p3.id = p.guest)));


ALTER VIEW public.userview OWNER TO "default";

--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public.areas (id, name, abbr, leader) FROM stdin;
1	ALABANZA	ALB	{28}
2	CRECIMIENTO	CRE	{26,27}
3	CONSOLIDACIÓN	CON	{33}
4	DIACONADO	DIA	{22}
6	INTERCESIÓN	INT	{23,32}
8	MATRIMONIOS	MAT	{24,25}
9	PROTEMPLO	PRO	{0}
7	JÓVENES	JCR	{31,30,1}
10	ASISTENTES	AST	{18}
5	GRANJA DE PAPÁ	GDP	{86,29}
\.


--
-- Data for Name: failures; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public.failures (id, date, error) FROM stdin;
1	2023-08-18 00:00:00	insertandoPrueba
2	2023-08-18 00:00:00	PostgresError: unterminated quoted identifier at or near ""PARAMS WHERE ATTRIBUTE = 'MAINTENANCE';"
3	2023-08-18 00:00:00	PostgresError: unterminated quoted identifier at or near ""PARAMS WHERE ATTRIBUTE = 'MAINTENANCE';"
4	2023-08-18 00:00:00	PostgresError: unterminated quoted identifier at or near ""PARAMS WHERE ATTRIBUTE = 'MAINTENANCE';"
5	2023-08-18 00:00:00	PostgresError: unterminated quoted identifier at or near ""PARAMS WHERE ATTRIBUTE = 'MAINTENANCE';"
6	2023-08-21 00:00:00	PostgresError: unterminated quoted identifier at or near ""PARAMS WHERE ATTRIBUTE = 'MAINTENANCE';"
7	2023-08-22 00:00:00	PostgresError: could not determine data type of parameter $1
8	2023-08-22 00:00:00	PostgresError: could not determine data type of parameter $2
9	2023-08-22 00:00:00	PostgresError: relation "PARAMS" does not exist
10	2023-08-28 00:00:00	PostgresError: unterminated quoted identifier at or near ""PARAMS WHERE ATTRIBUTE = 'MAINTENANCE';"
11	2023-08-29 00:00:00	PostgresError: relation "PARAMS" does not exist
12	2023-08-29 00:42:17.857502	PostgresError: relation "paramxs" does not exist
13	2023-09-01 15:29:48.136564	PostgresError: could not determine data type of parameter $1
14	2023-09-01 17:12:23.504099	PostgresError: syntax error at or near "RETURNING"
15	2023-09-01 17:12:41.339086	PostgresError: syntax error at or near "RETURNING"
16	2023-09-01 17:36:59.8787	PostgresError: syntax error at or near "USER"
17	2023-09-01 17:39:54.973601	PostgresError: syntax error at or near "USER"
18	2023-09-01 17:52:48.282546	PostgresError: missing FROM-clause entry for table "p"
19	2023-09-01 17:54:18.727056	PostgresError: column "parent_relationship" does not exist
20	2023-09-01 17:58:54.660431	PostgresError: column "parent_relationship" does not exist
21	2023-09-01 17:59:35.230501	PostgresError: column "parent_relationship" does not exist
22	2023-09-01 18:01:54.507461	PostgresError: missing FROM-clause entry for table "p"
23	2023-09-01 18:02:33.210435	PostgresError: missing FROM-clause entry for table "persons"
24	2023-09-01 20:39:47.259998	PostgresError: more than one row returned by a subquery used as an expression
25	2023-09-01 20:56:31.201503	PostgresError: syntax error at or near "FROM"
26	2023-09-01 21:11:41.497056	PostgresError: syntax error at or near "ANY"
27	2023-09-01 21:34:46.552857	PostgresError: syntax error at or near "RETURNING"
28	2023-09-02 05:16:11.80577	PostgresError: syntax error at or near "."
29	2023-09-02 05:17:29.298105	PostgresError: syntax error at or near "."
30	2023-09-02 05:18:17.834502	PostgresError: invalid input syntax for type integer: "5,6"
31	2023-09-02 05:24:47.539623	PostgresError: syntax error at or near "$2"
32	2023-09-02 05:25:24.051884	PostgresError: syntax error at or near "$2"
33	2023-09-02 05:25:52.650103	PostgresError: syntax error at or near "$2"
34	2023-09-02 05:28:44.66466	PostgresError: invalid input syntax for type integer: "5,6"
35	2023-09-02 05:31:29.924959	PostgresError: invalid input syntax for type integer: "5,6"
36	2023-09-02 05:34:42.212799	PostgresError: invalid input syntax for type integer: "5,6,7"
37	2023-09-02 05:34:47.417568	PostgresError: invalid input syntax for type integer: "5,6"
38	2023-09-02 05:35:26.017158	PostgresError: invalid input syntax for type integer: "5,6"
39	2023-09-02 05:37:31.074312	PostgresError: invalid input syntax for type integer: "5,6"
40	2023-09-02 05:37:50.486884	PostgresError: invalid input syntax for type integer: "5,6"
41	2023-09-02 05:38:11.279232	PostgresError: invalid input syntax for type integer: "5,6"
42	2023-09-02 05:43:12.621255	PostgresError: syntax error at or near "$1"
43	2023-09-02 05:49:37.269743	PostgresError: syntax error at or near "WHERE"
44	2023-09-02 05:49:54.938261	PostgresError: operator does not exist: integer = record
45	2023-09-02 05:53:08.955761	PostgresError: syntax error at or near "{"
46	2023-09-02 05:53:50.341114	PostgresError: syntax error at or near "["
47	2023-09-02 05:56:19.473347	PostgresError: function array_append(integer[], text[]) does not exist
48	2023-09-02 05:56:55.160463	PostgresError: function array_append(integer[], text[]) does not exist
49	2023-09-02 13:19:41.448323	Error: UNDEFINED_VALUE: Undefined values are not allowed
50	2023-09-02 13:20:06.861731	Error: UNDEFINED_VALUE: Undefined values are not allowed
51	2023-09-03 04:50:22.962977	Error: UNDEFINED_VALUE: Undefined values are not allowed
52	2023-09-03 13:28:14.415864	TypeError: Cannot convert undefined or null to object
53	2023-09-03 13:31:24.26624	TypeError: Cannot convert undefined or null to object
54	2023-09-03 13:41:04.884392	TypeError: Cannot convert undefined or null to object
55	2023-09-04 16:49:56.335108	Error: UNDEFINED_VALUE: Undefined values are not allowed
56	2023-09-04 17:19:49.081859	Error: write CONNECTION_CLOSED ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com:5432
57	2023-09-04 17:22:33.979054	PostgresError: column "guest" does not exist
58	2023-09-04 17:44:11.645756	PostgresError: null value in column "guest" of relation "persons" violates not-null constraint
59	2023-09-04 19:10:48.640711	Error: getaddrinfo ENOTFOUND ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com
60	2023-09-04 20:40:20.045201	Error: UNDEFINED_VALUE: Undefined values are not allowed
61	2023-09-04 20:43:36.721752	Error: UNDEFINED_VALUE: Undefined values are not allowed
62	2023-09-04 20:44:21.251023	Error: UNDEFINED_VALUE: Undefined values are not allowed
63	2023-09-04 20:44:46.567008	Error: UNDEFINED_VALUE: Undefined values are not allowed
64	2023-09-04 20:48:09.372943	Error: UNDEFINED_VALUE: Undefined values are not allowed
65	2023-09-10 06:46:55.086839	Error: UNDEFINED_VALUE: Undefined values are not allowed
66	2023-09-10 07:23:21.925976	TypeError: Cannot convert undefined or null to object
67	2023-09-10 07:27:20.584865	TypeError: Cannot convert undefined or null to object
68	2023-09-10 07:34:14.87225	TypeError: Cannot convert undefined or null to object
69	2023-09-10 07:34:20.521528	TypeError: Cannot convert undefined or null to object
70	2023-11-05 18:46:11.706845	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
71	2023-11-05 18:48:18.836411	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
72	2023-11-05 18:54:31.107275	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
73	2023-11-05 18:54:33.449035	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
74	2023-12-01 16:58:01.465976	Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
75	2024-01-21 17:17:22.490306	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
76	2024-02-02 10:36:09.15203	PostgresError: null value in column "userID" of relation "transactions" violates not-null constraint
77	2024-02-02 10:36:09.146227	PostgresError: null value in column "userID" of relation "transactions" violates not-null constraint
78	2024-02-02 10:42:58.769809	PostgresError: prepared statement "6q1whay4obt7" does not exist
79	2024-02-03 13:51:55.760323	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
80	2024-02-03 14:40:01.46743	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
81	2024-02-03 14:40:06.557485	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
82	2024-02-03 16:04:44.823878	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
83	2024-02-06 19:47:26.957259	Error: UNDEFINED_VALUE: Undefined values are not allowed
84	2024-02-06 20:46:26.758441	TypeError: Cannot convert undefined or null to object
85	2024-02-06 21:47:34.812211	PostgresError: null value in column "value" of relation "transactions" violates not-null constraint
86	2024-02-07 02:54:43.896634	PostgresError: invalid input syntax for type integer: "27.04633643325089"
87	2024-02-07 02:56:11.138311	PostgresError: invalid input syntax for type integer: "27.046339201927957"
88	2024-02-07 03:35:21.82987	TypeError: Cannot read properties of null (reading 'substring')
89	2024-02-07 03:36:16.598454	TypeError: Cannot read properties of null (reading 'substring')
90	2024-02-07 03:37:33.435731	TypeError: user.birth?.substring is not a function
91	2024-02-07 03:37:54.168792	TypeError: user.birth.substring is not a function
92	2024-02-07 03:38:41.046282	TypeError: user.birth.substring is not a function
93	2024-02-08 02:24:23.626164	TypeError: Cannot convert undefined or null to object
94	2024-02-25 20:57:03.050918	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
95	2024-02-29 22:40:36.064864	TypeError: Cannot convert undefined or null to object
96	2024-02-29 22:40:40.7553	TypeError: Cannot convert undefined or null to object
97	2024-03-03 01:11:14.084348	TypeError: Cannot convert undefined or null to object
98	2024-03-03 01:11:22.08911	TypeError: Cannot convert undefined or null to object
99	2024-03-03 01:11:33.322092	TypeError: Cannot convert undefined or null to object
100	2024-03-03 01:11:38.892451	TypeError: Cannot convert undefined or null to object
101	2024-03-03 01:11:42.306234	TypeError: Cannot convert undefined or null to object
102	2024-03-03 01:11:48.763704	TypeError: Cannot convert undefined or null to object
103	2024-03-03 01:17:29.602519	TypeError: Cannot convert undefined or null to object
104	2024-03-03 15:22:03.585038	PostgresError: more than one row returned by a subquery used as an expression
105	2024-03-03 15:23:18.664743	PostgresError: more than one row returned by a subquery used as an expression
106	2024-03-03 15:23:26.169493	PostgresError: more than one row returned by a subquery used as an expression
107	2024-03-03 15:23:39.32017	PostgresError: more than one row returned by a subquery used as an expression
108	2024-03-03 15:23:40.577707	PostgresError: more than one row returned by a subquery used as an expression
109	2024-03-03 15:23:47.146922	PostgresError: more than one row returned by a subquery used as an expression
110	2024-03-03 15:23:47.990076	PostgresError: more than one row returned by a subquery used as an expression
111	2024-03-03 15:23:48.705625	PostgresError: more than one row returned by a subquery used as an expression
112	2024-03-03 15:24:24.253897	PostgresError: more than one row returned by a subquery used as an expression
113	2024-03-03 15:24:46.582121	PostgresError: more than one row returned by a subquery used as an expression
114	2024-03-03 15:24:48.140439	PostgresError: more than one row returned by a subquery used as an expression
115	2024-03-03 15:24:51.211215	PostgresError: more than one row returned by a subquery used as an expression
116	2024-03-03 15:24:51.761968	PostgresError: more than one row returned by a subquery used as an expression
117	2024-03-03 15:24:52.19327	PostgresError: more than one row returned by a subquery used as an expression
118	2024-03-03 15:24:52.384929	PostgresError: more than one row returned by a subquery used as an expression
119	2024-03-03 15:24:52.585509	PostgresError: more than one row returned by a subquery used as an expression
120	2024-03-03 15:24:52.797851	PostgresError: more than one row returned by a subquery used as an expression
121	2024-03-03 15:26:21.0989	PostgresError: more than one row returned by a subquery used as an expression
122	2024-03-03 15:26:51.581008	PostgresError: more than one row returned by a subquery used as an expression
123	2024-03-03 15:29:45.829464	PostgresError: more than one row returned by a subquery used as an expression
124	2024-03-03 15:30:35.137923	PostgresError: more than one row returned by a subquery used as an expression
125	2024-03-03 15:30:38.506428	PostgresError: more than one row returned by a subquery used as an expression
126	2024-03-03 15:30:38.975847	PostgresError: more than one row returned by a subquery used as an expression
127	2024-03-03 15:30:39.482687	PostgresError: more than one row returned by a subquery used as an expression
128	2024-03-03 15:30:39.943194	PostgresError: more than one row returned by a subquery used as an expression
129	2024-03-03 15:30:40.099781	PostgresError: more than one row returned by a subquery used as an expression
130	2024-03-03 15:30:40.260754	PostgresError: more than one row returned by a subquery used as an expression
131	2024-03-03 15:30:40.452443	PostgresError: more than one row returned by a subquery used as an expression
132	2024-03-03 15:30:40.784247	PostgresError: more than one row returned by a subquery used as an expression
133	2024-03-03 15:30:40.952215	PostgresError: more than one row returned by a subquery used as an expression
134	2024-03-03 15:30:41.109328	PostgresError: more than one row returned by a subquery used as an expression
135	2024-03-03 15:30:41.278711	PostgresError: more than one row returned by a subquery used as an expression
136	2024-03-03 15:30:41.426526	PostgresError: more than one row returned by a subquery used as an expression
137	2024-03-03 15:30:41.602139	PostgresError: more than one row returned by a subquery used as an expression
138	2024-03-03 15:39:04.784741	PostgresError: more than one row returned by a subquery used as an expression
139	2024-03-03 15:39:13.318399	PostgresError: more than one row returned by a subquery used as an expression
140	2024-03-03 15:41:02.620685	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
141	2024-03-03 15:41:11.943454	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
142	2024-03-03 17:34:58.757726	TypeError: Cannot convert undefined or null to object
143	2024-03-03 17:35:02.480543	TypeError: Cannot convert undefined or null to object
144	2024-03-03 17:35:10.687619	TypeError: Cannot convert undefined or null to object
145	2024-03-04 10:28:06.837855	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
146	2024-03-04 10:28:12.452307	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
147	2024-03-04 10:28:20.535839	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
148	2024-03-04 10:28:22.941485	PostgresError: null value in column "age" of relation "persons" violates not-null constraint
149	2024-03-04 13:09:05.471082	Error: UNDEFINED_VALUE: Undefined values are not allowed
150	2024-03-04 13:13:02.310907	Error: UNDEFINED_VALUE: Undefined values are not allowed
151	2024-03-26 21:01:34.724893	TypeError: Cannot convert undefined or null to object
152	2024-03-29 18:42:07.120119	TypeError: Cannot convert undefined or null to object
153	2024-03-29 18:42:14.212227	TypeError: Cannot convert undefined or null to object
154	2024-03-29 18:42:19.38967	TypeError: Cannot convert undefined or null to object
155	2024-03-29 18:42:39.335075	TypeError: Cannot convert undefined or null to object
156	2024-04-06 22:28:53.875529	TypeError: Cannot convert undefined or null to object
157	2024-04-07 01:13:51.956018	TypeError: Cannot convert undefined or null to object
158	2024-04-07 01:13:55.246675	TypeError: Cannot convert undefined or null to object
159	2024-04-07 13:06:46.827418	TypeError: Cannot convert undefined or null to object
160	2024-04-07 13:06:49.343708	TypeError: Cannot convert undefined or null to object
161	2024-04-07 15:31:09.783889	PostgresError: more than one row returned by a subquery used as an expression
162	2024-04-07 15:34:07.719767	PostgresError: more than one row returned by a subquery used as an expression
163	2024-04-07 15:35:14.715952	PostgresError: more than one row returned by a subquery used as an expression
164	2024-04-07 15:35:29.015912	PostgresError: more than one row returned by a subquery used as an expression
165	2024-04-07 15:36:40.699047	PostgresError: more than one row returned by a subquery used as an expression
166	2024-04-07 17:22:27.903276	PostgresError: more than one row returned by a subquery used as an expression
167	2024-04-07 17:23:41.504676	PostgresError: more than one row returned by a subquery used as an expression
168	2024-04-07 17:23:44.878534	PostgresError: more than one row returned by a subquery used as an expression
169	2024-04-07 17:27:11.251085	PostgresError: more than one row returned by a subquery used as an expression
170	2024-04-07 17:27:15.391445	PostgresError: more than one row returned by a subquery used as an expression
171	2024-04-07 17:27:33.455068	PostgresError: more than one row returned by a subquery used as an expression
172	2024-04-07 17:27:42.57789	PostgresError: more than one row returned by a subquery used as an expression
173	2024-04-07 17:28:32.710076	PostgresError: more than one row returned by a subquery used as an expression
174	2024-04-07 17:28:37.815726	PostgresError: more than one row returned by a subquery used as an expression
175	2024-04-07 17:31:16.242324	PostgresError: more than one row returned by a subquery used as an expression
176	2024-04-07 17:37:31.332654	PostgresError: more than one row returned by a subquery used as an expression
177	2024-04-07 17:38:45.893237	PostgresError: more than one row returned by a subquery used as an expression
178	2024-04-07 17:39:22.393312	PostgresError: more than one row returned by a subquery used as an expression
179	2024-04-07 17:40:23.7852	PostgresError: more than one row returned by a subquery used as an expression
180	2024-04-07 17:40:30.196367	PostgresError: more than one row returned by a subquery used as an expression
181	2024-04-07 17:40:33.243475	PostgresError: more than one row returned by a subquery used as an expression
182	2024-04-07 17:43:05.221954	PostgresError: more than one row returned by a subquery used as an expression
183	2024-04-07 17:43:08.542272	PostgresError: more than one row returned by a subquery used as an expression
184	2024-04-07 17:43:18.360858	PostgresError: more than one row returned by a subquery used as an expression
185	2024-04-07 17:43:23.324652	PostgresError: more than one row returned by a subquery used as an expression
186	2024-04-07 17:44:15.813108	PostgresError: more than one row returned by a subquery used as an expression
187	2024-04-07 17:45:46.297745	PostgresError: more than one row returned by a subquery used as an expression
188	2024-04-07 17:47:38.17099	PostgresError: more than one row returned by a subquery used as an expression
189	2024-04-07 17:48:09.938651	PostgresError: more than one row returned by a subquery used as an expression
190	2024-04-07 17:48:14.132058	PostgresError: more than one row returned by a subquery used as an expression
191	2024-04-07 17:48:55.57866	PostgresError: more than one row returned by a subquery used as an expression
192	2024-04-07 17:48:57.509049	TypeError: Cannot convert undefined or null to object
193	2024-04-07 17:49:14.887311	PostgresError: more than one row returned by a subquery used as an expression
194	2024-04-07 17:49:17.440029	PostgresError: more than one row returned by a subquery used as an expression
195	2024-04-07 17:49:23.057605	PostgresError: more than one row returned by a subquery used as an expression
196	2024-04-07 17:49:25.08819	PostgresError: more than one row returned by a subquery used as an expression
197	2024-04-07 17:49:36.861546	PostgresError: more than one row returned by a subquery used as an expression
198	2024-04-07 17:49:39.504265	PostgresError: more than one row returned by a subquery used as an expression
199	2024-04-07 17:49:57.000774	PostgresError: more than one row returned by a subquery used as an expression
200	2024-04-07 17:57:09.042318	PostgresError: more than one row returned by a subquery used as an expression
201	2024-04-07 17:59:21.796645	PostgresError: more than one row returned by a subquery used as an expression
202	2024-04-07 17:59:28.37285	PostgresError: more than one row returned by a subquery used as an expression
203	2024-04-07 17:59:29.753367	PostgresError: more than one row returned by a subquery used as an expression
204	2024-04-07 17:59:35.459338	PostgresError: more than one row returned by a subquery used as an expression
205	2024-04-07 18:01:40.407451	PostgresError: more than one row returned by a subquery used as an expression
206	2024-04-07 18:02:24.088214	PostgresError: more than one row returned by a subquery used as an expression
207	2024-04-07 18:02:48.972531	PostgresError: more than one row returned by a subquery used as an expression
208	2024-04-07 18:04:09.471718	PostgresError: more than one row returned by a subquery used as an expression
209	2024-04-07 18:04:18.641609	PostgresError: more than one row returned by a subquery used as an expression
210	2024-04-07 18:04:26.967417	PostgresError: more than one row returned by a subquery used as an expression
211	2024-04-07 18:04:40.574775	PostgresError: more than one row returned by a subquery used as an expression
212	2024-04-07 18:05:14.414311	TypeError: Cannot convert undefined or null to object
213	2024-04-07 18:05:19.080578	TypeError: Cannot convert undefined or null to object
214	2024-04-07 18:06:15.287986	PostgresError: more than one row returned by a subquery used as an expression
215	2024-04-07 18:06:27.000012	PostgresError: more than one row returned by a subquery used as an expression
216	2024-04-07 18:26:35.346613	Error: write CONNECTION_CLOSED ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com:5432
217	2024-04-10 12:35:45.166109	PostgresError: more than one row returned by a subquery used as an expression
218	2024-04-10 12:36:37.147415	PostgresError: more than one row returned by a subquery used as an expression
219	2024-04-10 12:41:37.896402	PostgresError: more than one row returned by a subquery used as an expression
220	2024-04-10 12:42:57.401174	PostgresError: more than one row returned by a subquery used as an expression
221	2024-04-10 12:43:34.262984	PostgresError: more than one row returned by a subquery used as an expression
222	2024-04-10 20:54:19.844873	TypeError: Cannot convert undefined or null to object
223	2024-04-10 20:59:05.496386	TypeError: Cannot convert undefined or null to object
224	2024-04-11 03:59:21.104631	TypeError: Cannot convert undefined or null to object
225	2024-04-11 03:59:41.422152	TypeError: Cannot convert undefined or null to object
226	2024-04-11 04:00:09.311717	TypeError: Cannot convert undefined or null to object
227	2024-04-11 04:00:16.658009	TypeError: Cannot convert undefined or null to object
228	2024-04-11 04:01:26.999451	TypeError: Cannot convert undefined or null to object
229	2024-04-11 04:01:33.703594	TypeError: Cannot convert undefined or null to object
230	2024-04-11 04:04:51.311776	TypeError: Cannot convert undefined or null to object
231	2024-04-11 04:04:55.865292	TypeError: Cannot convert undefined or null to object
232	2024-04-11 04:05:00.935773	TypeError: Cannot convert undefined or null to object
233	2024-04-11 04:05:54.818543	TypeError: Cannot convert undefined or null to object
234	2024-04-13 19:34:24.469	TypeError: Cannot convert undefined or null to object
235	2024-04-13 19:34:30.700884	TypeError: Cannot convert undefined or null to object
236	2024-04-13 19:35:28.514275	TypeError: Cannot convert undefined or null to object
237	2024-04-14 15:07:24.405904	TypeError: Cannot convert undefined or null to object
238	2024-04-14 16:13:31.855702	TypeError: Cannot convert undefined or null to object
239	2024-04-14 16:13:43.090063	TypeError: Cannot convert undefined or null to object
240	2024-04-14 16:13:43.28354	TypeError: Cannot convert undefined or null to object
241	2024-04-14 16:13:43.457528	TypeError: Cannot convert undefined or null to object
242	2024-04-14 16:13:45.760945	TypeError: Cannot convert undefined or null to object
243	2024-04-14 16:13:49.74513	TypeError: Cannot convert undefined or null to object
244	2024-04-14 16:13:50.77685	TypeError: Cannot convert undefined or null to object
245	2024-04-14 16:13:51.220886	TypeError: Cannot convert undefined or null to object
246	2024-04-14 16:14:10.681945	TypeError: Cannot convert undefined or null to object
247	2024-04-14 16:14:21.389261	TypeError: Cannot convert undefined or null to object
248	2024-04-14 16:15:28.144737	TypeError: Cannot convert undefined or null to object
249	2024-04-14 16:15:33.423914	TypeError: Cannot convert undefined or null to object
250	2024-04-14 17:29:25.858485	TypeError: Cannot convert undefined or null to object
251	2024-04-14 17:29:26.329686	RangeError: Invalid time value
252	2024-04-14 17:30:15.085375	TypeError: Cannot convert undefined or null to object
253	2024-04-14 17:32:32.433786	TypeError: Cannot convert undefined or null to object
254	2024-04-14 17:32:32.815215	RangeError: Invalid time value
255	2024-04-14 17:32:52.43339	TypeError: Cannot convert undefined or null to object
256	2024-04-14 20:17:57.193121	TypeError: Cannot convert undefined or null to object
257	2024-04-14 20:21:21.694153	TypeError: Cannot convert undefined or null to object
258	2024-04-14 20:21:22.23267	RangeError: Invalid time value
259	2024-04-14 20:21:28.196508	TypeError: Cannot convert undefined or null to object
260	2024-04-14 20:21:28.541924	RangeError: Invalid time value
261	2024-04-14 20:22:44.232502	TypeError: Cannot convert undefined or null to object
262	2024-04-14 20:22:44.521133	RangeError: Invalid time value
263	2024-04-14 20:22:49.638907	TypeError: Cannot convert undefined or null to object
264	2024-04-14 20:22:50.081259	RangeError: Invalid time value
265	2024-04-14 20:23:21.545843	TypeError: Cannot convert undefined or null to object
266	2024-04-14 20:23:22.039846	RangeError: Invalid time value
267	2024-04-14 20:24:41.853205	TypeError: Cannot convert undefined or null to object
268	2024-04-14 20:24:42.322745	RangeError: Invalid time value
269	2024-04-14 20:40:03.359888	TypeError: Cannot convert undefined or null to object
270	2024-04-14 21:53:11.317596	TypeError: Cannot convert undefined or null to object
271	2024-04-14 21:53:11.701226	RangeError: Invalid time value
272	2024-04-14 21:53:29.638815	TypeError: Cannot convert undefined or null to object
273	2024-04-15 23:00:19.226859	TypeError: Cannot convert undefined or null to object
274	2024-04-15 23:00:23.772521	TypeError: Cannot convert undefined or null to object
275	2024-04-15 23:00:27.641704	TypeError: Cannot convert undefined or null to object
276	2024-04-15 23:00:34.123945	TypeError: Cannot convert undefined or null to object
277	2024-04-17 03:01:14.966933	TypeError: Cannot convert undefined or null to object
278	2024-04-17 03:01:15.369548	RangeError: Invalid time value
279	2024-04-17 03:11:53.332251	TypeError: Cannot convert undefined or null to object
280	2024-04-17 03:11:53.594787	RangeError: Invalid time value
281	2024-04-17 22:39:48.301405	TypeError: Cannot convert undefined or null to object
282	2024-04-17 22:47:05.432801	Error: write CONNECTION_CLOSED ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com:5432
283	2024-04-17 23:06:36.418923	TypeError: Cannot convert undefined or null to object
284	2024-04-18 11:56:10.359623	TypeError: Cannot convert undefined or null to object
285	2024-04-18 20:51:02.221305	TypeError: Cannot convert undefined or null to object
286	2024-04-18 20:51:04.220038	TypeError: Cannot convert undefined or null to object
287	2024-04-18 21:35:09.976176	TypeError: Cannot convert undefined or null to object
288	2024-04-18 21:37:05.981114	TypeError: Cannot convert undefined or null to object
289	2024-04-21 15:10:15.373534	TypeError: Cannot convert undefined or null to object
290	2024-04-21 15:11:32.471204	TypeError: Cannot convert undefined or null to object
291	2024-04-21 15:14:13.653681	TypeError: Cannot convert undefined or null to object
292	2024-04-21 15:14:48.625109	TypeError: Cannot convert undefined or null to object
293	2024-04-21 16:37:09.328693	TypeError: Cannot convert undefined or null to object
294	2024-04-21 16:38:17.610522	TypeError: Cannot convert undefined or null to object
295	2024-04-21 16:40:51.557049	TypeError: Cannot convert undefined or null to object
296	2024-04-21 16:49:27.959123	TypeError: Cannot convert undefined or null to object
297	2024-04-21 16:49:30.198292	TypeError: Cannot convert undefined or null to object
298	2024-04-21 17:16:31.255029	TypeError: Cannot convert undefined or null to object
299	2024-04-21 17:18:50.101875	TypeError: Cannot convert undefined or null to object
300	2024-04-21 17:20:22.588344	TypeError: Cannot convert undefined or null to object
301	2024-04-21 17:23:25.600923	TypeError: Cannot convert undefined or null to object
302	2024-04-21 17:34:43.350202	Error: write CONNECTION_CLOSED ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com:5432
303	2024-04-22 00:57:33.191084	TypeError: Cannot convert undefined or null to object
304	2024-04-22 00:58:03.081801	TypeError: Cannot convert undefined or null to object
305	2024-04-23 00:37:59.52147	TypeError: Cannot convert undefined or null to object
306	2024-04-23 02:01:19.914859	TypeError: Cannot convert undefined or null to object
307	2024-04-23 02:05:17.044812	TypeError: Cannot convert undefined or null to object
308	2024-04-23 02:05:46.312669	TypeError: Cannot convert undefined or null to object
309	2024-04-23 02:08:29.314567	TypeError: Cannot convert undefined or null to object
310	2024-04-23 02:09:52.900233	TypeError: Cannot convert undefined or null to object
\.


--
-- Data for Name: params; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public.params (id, attribute, value) FROM stdin;
4	TARIFA_BEBE	0
5	TRANSPORT	20000
2	TARIFA_MENOR	230000
3	TARIFA_NINO	130000
1	TARIFA_COMPLETA	250000
6	MAINTENANCE	0
\.


--
-- Data for Name: persons; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public.persons (id, document_type, document, name, age, transport, admin, password, parent_relationship, area, guest, registered_by, phone, birth) FROM stdin;
122	PPT	31060236	LISSET ALVAREZ BENITES DEL VALLE	21	1	0	\N	\N	JCR	0	31	3005084386	2002-11-25
123	TI	1232599094	CRISLAN JOSIAS HENRIQUEZ ROCHA	24	1	0	\N	\N	JCR	0	31	3001522362	2000-04-03
124	TI	1034309496	ISABELA PEÑA	9	1	0	\N	\N	GDP	0	29	3058260911	2015-02-21
125	CE	31060236	LISSETH DEL VALLE ALVAREZ BENITES	21	1	0	\N	\N	CRE	0	26	3005084386	2002-11-25
126	CC	1097490537	GERMAN CHAVEZ	19	1	0	\N	\N	JCR	0	29	3164708878	2005-04-02
128	CE	16980379	ANDRÉS HIBARRA	41	1	0	\N	\N	AST	0	22	3212716188	1982-12-12
129	RC	1145230416	ZAEL MATEO FRATERNO MÁRQUEZ 	2	1	0	\N	\N	AST	0	22	3043898564	2021-06-19
127	CE	30540918	IULEINY GRATEROL 	22	1	0	\N	\N	AST	0	22	3043898564	2001-10-13
130	CC	1015426072	JULIANA MANRIQUE	32	1	0	\N	\N	ALB	0	86	3196526774	1991-09-28
24	CC	79845124	ROBINSON BARRERA BURGOS	47	0	2	12345	{25}	MAT	0	1	3115473303	1976-09-15
131	CC	80770635	SERGIO COGOLLOS	39	1	0	\N	\N	MAT	0	86	3193126769	1985-01-22
32	CC	41458421	ELVIA ALONSO	15	1	2	12345	\N	INT	0	1	3134843167	\N
22	CC	1023866790	YULI GUTIERREZ	15	1	2	12345	{35}	DIA	0	1	3112694193	\N
28	CC	79666065	WILSON CHAPARRO RIAÑO	50	1	2	12345	{23}	ALB	0	1	3184399053	\N
83	CC	60376865	DORIS PEREZ	47	1	0	\N	\N	DIA	0	26	3156646517	1976-12-08
87	CC	79318539	MARIO VACA 	59	0	0	\N	\N	DIA	0	22	3153313665	1964-06-16
88	CC	41537624	EMPERATRIZ GUTIÉRREZ 	82	0	0	\N	\N	DIA	0	22	3153313665	1942-03-15
33	CC	41923508	LUZ NANCY MURCIA	15	1	2	12345	{108}	CON	0	1	3136244028	\N
31	CC	53130289	LAURA PATRICIA RAMIREZ	15	1	2	12345	{121}	JCR	0	1	3204359021	\N
132	TI	1019608222	MIGUEL ÁNGEL COGOLLOS	11	1	0	\N	\N	GDP	0	86	3196526774	2012-08-24
133	TI	1019608431	VICTORIA COGOLLOS	10	1	0	\N	\N	GDP	0	86	3196526774	2013-12-03
134	CC	1000694466	ANNY LORENA MAFLA JIMÉNEZ 	21	1	0	\N	\N	AST	106	18	3114495030	2003-01-15
135	CC	1023038786	NEREYDA KATHERIN MAFLA JIMÉNEZ	24	1	0	\N	\N	AST	106	18	3137293987	1999-10-09
136	CC	1085182450	JOSÉ JOAQUÍN JIMÉNEZ PEINADO	25	1	0	\N	\N	AST	106	18	3122038876	1998-07-29
116	CC	1007098096	SEBASTIAN RESTREPO GAZABON	23	1	0	\N	\N	ALB	0	28	3003253572	2000-06-23
120	TI	1027530234	HAROLD SAMUEL MILA ROBAYO	13	1	0	\N	\N	JCR	0	31	3158919600	2010-05-31
112	CC	51811573	BLANCA LEONOR BERNAL CASTRO 	57	1	0	\N	\N	DIA	0	18	3126250351	1966-06-18
76	TI	1034401726	SARA SOFIA CHAVES MORENO	14	1	0	\N	\N	ALB	19	19	3177262179	2009-09-02
79	PPT	3180635	ARTURO DANIEL VILLAMIZAR CÁCERES 	37	1	0	\N	\N	PRO	0	18	3113732724	1986-06-05
29	CC	52499428	CAROL ALONSO	45	0	2	12345	{81}	GDP	0	1	3204301655	1978-10-26
19	CC	52530384	YULY ADRIANA NARANJO ALONSO	43	0	3	12345	{18}	ALB	0	1	3102422085	\N
77	TI	1021684331	JOSUÉ FELIPE BARRERA ALONSO	12	0	0	\N	{24}	JCR	0	18	3115473303	2011-12-27
78	TI	1028622167	ROBINSON DANIEL BARRERA ALONSO	10	0	0	\N	{24}	GDP	0	18	3115473303	2013-08-01
113	CC	37933482	MARIBEL JIMÉNEZ SANTAMARÍA	60	1	0	\N	\N	INT	0	18	3005084132	1963-11-25
117	CC	53179319	ZAIRA ZULEICA ESCOBAR BONILLA	38	1	0	\N	\N	ALB	28	28	3147980171	1985-10-08
118	CC	1014189464	SOFIA ARGÜELLO	18	1	0	\N	\N	GDP	0	86	3007427547	2005-12-23
121	RC	1015000053	BENJAMIN PAREDES RAMIREZ	4	1	0	\N	\N	GDP	0	31	3204359021	2019-11-16
119	TI	1141116471	LUNA ARGÜELLO	6	1	0	\N	\N	ALB	0	86	3001556566	2017-10-02
26	CC	52542780	ANGELA ROCÍO ALONSO	43	1	2	12345	{}	CRE	0	1	3160499653	1980-10-25
100	CC	52981759	VIVIANA HERRERA	40	1	0	\N	\N	GDP	0	29	3213309792	1983-05-25
101	CC	35458566	MARIA EUGENIA BUENO	68	1	0	\N	\N	GDP	0	31	3108135524	1955-12-05
102	PPT	1245274	GABRIELA ALEUZENEW VEGA VEGA	29	1	0	\N	\N	GDP	0	31	3208190914	1995-02-18
97	CC	1034399739	LUIS ÁNGEL MILLÁN NARANJO	18	0	0	\N	{18}	ALB	0	18	3209254883	2006-02-28
98	TI	1034400977	NICOLÁS ESTEBAN MILLÁN NARANJO	16	0	0	\N	{18}	ALB	0	18	3112267485	2007-05-24
99	TI	1034402397	JOSUÉ DAVID MILLÁN NARANJO 	14	0	0	\N	{18}	GDP	0	18	3006878253	2010-01-16
18	CC	79515563	LUIS CARLOS MILLÁN FUENTES	55	1	3	12345	{18}	AST	0	1	3112781551	1968-10-28
106	CC	52372452	LAURA  CAROLINA JIMÉNEZ LONDOÑO	46	1	0	\N	\N	PRO	0	26	3144758379	1977-09-29
1	CC	1032488686	ALEJANDRO RIOS	26	0	3	12345	{29}	JCR	0	1	3188501911	\N
91	CC	1143464568	CAROLINA ANDREA ACOSTA MERCADO 	25	1	0	\N	\N	DIA	0	22	3014230755	1998-07-27
92	CC	140888457	JEFFRY JOSUÉ MEDINA BARANDICA	27	1	0	\N	\N	DIA	0	22	3003394641	1996-10-15
94	CC	79988274	JOHN ALEXANDER GUTIERREZ 	44	0	0	\N	\N	ALB	0	19	3106981743	1979-05-01
93	CC	52971518	ARIANA PAOLA LÓPEZ GARCÍA 	41	0	0	\N	{94}	ALB	0	19	3118106957	1982-12-14
95	RC	1222221088	HANNAH SOFÍA GUTIÉRREZ LÓPEZ	5	0	0	\N	{94}	GDP	0	18	3118106957	2019-01-24
96	CC	1048329668	ANGEL JUNIOR ROCHA GUERRERO	32	1	0	\N	\N	GDP	0	18	3104866092	1991-09-17
89	CC	1045740801	MARIA CAROLINA MERCADO	27	1	0	\N	\N	JCR	0	31	3023734153	1996-08-11
90	CC	1068736482	SARA MARTINEZ	23	0	0	\N	\N	CRE	0	26	3004573555	2000-04-26
23	CC	26026355	AURY CALDERA	15	1	2	12345	{35}	INT	0	1	3143421437	\N
30	CC	79914008	DIEGO ENRIQUE PAREDES	15	1	2	12345	{30}	JCR	0	1	3204459306	\N
107	PPT	1403624	SIXTO GREGORIO LOPEZ	43	1	0	\N	\N	PRO	0	26	3022228944	1980-06-27
86	CC	1016088252	NICOLE SOTO	27	1	2	12345	{29,1}	GDP	0	1	3023253352	1996-08-28
103	TI	1021686920	JOSEPH DAVID MONROY ALONSO	9	1	0	\N	{26}	GDP	0	86	3160499653	2014-06-27
82	CC	1025141118	SARA MICHELLE MONROY ALONSO	19	1	0	\N	{26}	GDP	0	34	3188912909	2004-04-28
85	CC	51762267	ALEXANDRA MARIÑO	59	1	0	\N	\N	DIA	0	22	3102341658	1965-01-29
81	CC	79800521	NELSON ENRIQUE LABRADOR CRUZ	48	0	0	\N	{29}	GDP	0	29	3116305100	1976-01-10
80	TI	1025325258	SERGIO IVAN LABRADOR ALONSO	15	0	0	\N	{81,29}	JCR	0	29	3204301655	2009-02-02
25	CC	52541070	MÓNICA ANDREA ALONSO	44	0	2	12345	{24}	MAT	0	1	3108019520	1979-11-23
108	CC	79522600	ALFREDO GUERRERO MURCIA	55	1	0	\N	\N	ALB	0	24	3204018087	1968-07-26
110	CC	1000617901	LUISA MARÍA GUERRERO MURCIA	24	1	0	\N	{108}	ALB	0	24	3209431316	2000-03-06
27	CC	79975725	CARLOS DAVID MONROY	44	1	2	12345	{56,26}	CRE	0	1	3015564747	1980-01-27
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public.transactions (id, date, value, authorized, donation, "userID", confirmed) FROM stdin;
127	2024-03-26 20:40:40.660217	150000	18	1	96	1
128	2024-03-26 22:10:18.478144	50000	18	1	97	1
129	2024-03-26 22:11:14.222421	50000	18	1	98	1
130	2024-03-26 22:12:08.160122	50000	18	1	99	1
131	2024-03-26 22:12:42.069777	50000	18	0	19	1
132	2024-03-26 22:13:19.340507	50000	18	0	18	1
133	2024-03-29 18:45:05.837443	100000	25	0	24	1
134	2024-03-29 18:45:46.445086	100000	25	0	78	1
135	2024-03-29 18:46:23.071971	100000	25	0	77	1
136	2024-03-29 18:47:13.423759	100000	25	0	25	1
137	2024-03-31 15:03:35.300033	20000	29	0	100	1
103	2024-02-29 16:54:01.678839	50000	19	0	76	1
138	2024-04-07 15:02:30.200986	20000	31	0	101	1
139	2024-04-07 15:05:11.328162	20000	31	0	102	1
142	2024-04-07 17:17:56.951803	20000	22	0	83	1
104	2024-02-29 22:38:20.152783	50000	18	0	25	1
105	2024-02-29 22:39:17.542091	50000	18	0	24	1
140	2024-04-07 15:19:35.337281	20000	86	0	103	1
141	2024-04-07 16:27:13.89848	50000	19	0	76	1
144	2024-04-07 17:22:45.691771	20000	86	0	101	1
153	2024-04-07 18:13:04.017785	100000	18	0	112	1
154	2024-04-07 18:13:37.253466	50000	18	0	32	1
151	2024-04-07 17:36:48.731223	10000	1	0	107	1
106	2024-02-29 22:46:41.809805	50000	18	0	78	1
107	2024-02-29 22:47:19.339604	50000	18	0	77	1
152	2024-04-07 17:37:21.425214	10000	1	0	106	1
155	2024-04-07 20:27:47.567925	10000	18	0	113	1
143	2024-04-07 17:21:26.641203	20000	86	0	82	1
112	2024-03-03 15:09:54.813133	10000	86	1	82	1
114	2024-03-03 15:14:25.892261	10000	86	0	1	1
109	2024-03-03 14:42:47.719017	30000	29	0	80	1
110	2024-03-03 14:44:11.718611	30000	29	0	81	1
111	2024-03-03 14:46:07.74881	40000	29	0	29	1
113	2024-03-03 15:10:41.001201	10000	26	0	83	1
115	2024-03-03 15:32:26.378154	10000	22	0	85	1
116	2024-03-03 17:22:33.077228	10000	22	0	87	1
117	2024-03-03 17:24:11.238989	10000	22	0	88	1
119	2024-03-03 17:41:26.285499	10000	86	0	86	1
108	2024-03-01 14:14:19.474451	20000	18	0	79	1
120	2024-03-03 17:41:59.233927	10000	26	0	90	1
118	2024-03-03 17:37:01.290129	10000	31	0	89	1
121	2024-03-10 17:35:55.887593	10000	22	0	91	1
122	2024-03-10 17:36:30.4883	10000	22	0	92	1
123	2024-03-24 18:31:35.271308	10000	19	0	93	1
124	2024-03-24 18:37:55.208344	10000	18	0	94	1
125	2024-03-24 18:41:47.562576	10000	18	0	95	1
126	2024-03-24 18:43:40.711321	150000	18	0	1	1
158	2024-04-07 21:01:06.243379	97300	24	0	108	1
159	2024-04-07 21:01:47.186872	80000	24	0	33	1
160	2024-04-07 21:02:42.872201	80000	24	0	110	1
156	2024-04-07 20:58:48.20376	10000	25	0	27	1
157	2024-04-07 20:59:42.195561	10000	25	0	26	1
186	2024-04-21 17:17:18.236422	270000	86	0	130	1
168	2024-04-14 17:23:46.279458	0	31	0	1	0
163	2024-04-14 16:12:08.318507	10000	28	0	28	1
164	2024-04-14 16:16:26.885199	10000	28	0	117	1
165	2024-04-14 16:19:15.912995	10000	28	0	116	1
166	2024-04-14 17:16:26.172304	100000	86	0	32	1
167	2024-04-14 17:20:47.252675	20000	29	0	23	1
169	2024-04-14 17:30:30.210246	10000	86	0	118	1
170	2024-04-14 17:33:08.73972	10000	86	0	119	1
171	2024-04-14 17:34:52.96035	10000	86	0	100	1
162	2024-04-12 23:31:51.186024	50000	18	0	76	1
172	2024-04-14 20:40:34.187925	30000	31	1	120	1
173	2024-04-14 21:54:10.087995	10000	31	0	121	1
191	2024-04-21 17:42:06.608438	10000	18	0	134	1
192	2024-04-21 17:43:01.187413	10000	18	0	136	1
193	2024-04-21 17:43:31.985292	10000	18	0	135	1
194	2024-04-21 17:44:36.275018	10000	18	0	107	1
195	2024-04-21 17:45:07.405071	10000	18	0	106	1
176	2024-04-21 15:00:29.470978	100000	29	0	95	1
177	2024-04-21 15:03:38.94054	100000	29	0	103	1
178	2024-04-21 15:08:29.491189	30000	29	0	101	1
179	2024-04-21 15:11:48.628978	13000	29	0	124	1
180	2024-04-21 15:12:57.043609	110000	29	0	82	1
181	2024-04-21 15:15:03.621622	10000	29	0	126	1
183	2024-04-21 15:15:42.023089	80000	29	0	76	1
190	2024-04-21 17:25:59.885864	50000	29	0	102	1
187	2024-04-21 17:19:04.958394	270000	86	0	131	1
188	2024-04-21 17:21:08.560493	250000	86	0	132	1
189	2024-04-21 17:23:43.973728	250000	86	0	133	1
184	2024-04-21 16:22:21.039244	50000	22	0	33	1
185	2024-04-21 16:41:37.057482	10000	22	0	127	1
182	2024-04-21 15:15:06.687877	100000	26	0	125	1
175	2024-04-17 23:07:22.203404	10000	31	1	123	1
174	2024-04-17 22:40:29.779353	10000	31	1	122	1
196	2024-04-22 01:37:19.026302	50000	24	0	108	0
197	2024-04-22 01:37:59.386514	50000	24	0	33	0
\.


--
-- Name: PERSONAS_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public."PERSONAS_ID_seq"', 136, true);


--
-- Name: failures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public.failures_id_seq', 310, true);


--
-- Name: table_name_id_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public.table_name_id_seq', 6, true);


--
-- Name: table_name_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public.table_name_id_seq1', 10, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public.transactions_id_seq', 197, true);


--
-- Name: persons PERSONAS_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT "PERSONAS_pkey" PRIMARY KEY (id);


--
-- Name: failures failures_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.failures
    ADD CONSTRAINT failures_pkey PRIMARY KEY (id);


--
-- Name: params table_name_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.params
    ADD CONSTRAINT table_name_pkey PRIMARY KEY (id);


--
-- Name: areas table_name_pkey1; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT table_name_pkey1 PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

