--
-- PostgreSQL database dump
--
-- To restore: createdb c && psql -d c -f database.sql
--


-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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

ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_time_slot_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_subject_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_faculty_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.faculty_subjects DROP CONSTRAINT IF EXISTS faculty_subjects_subject_id_fkey;
ALTER TABLE IF EXISTS ONLY public.faculty_subjects DROP CONSTRAINT IF EXISTS faculty_subjects_faculty_id_fkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.class_subjects DROP CONSTRAINT IF EXISTS class_subjects_subject_id_fkey;
ALTER TABLE IF EXISTS ONLY public.class_subjects DROP CONSTRAINT IF EXISTS class_subjects_class_id_fkey;
DROP INDEX IF EXISTS public.idx_time_tables_time_slot;
DROP INDEX IF EXISTS public.idx_time_tables_faculty;
DROP INDEX IF EXISTS public.idx_time_tables_class;
DROP INDEX IF EXISTS public.idx_time_tables_branch;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_pkey;
ALTER TABLE IF EXISTS ONLY public.time_tables DROP CONSTRAINT IF EXISTS time_tables_class_id_time_slot_id_academic_year_semester_va_key;
ALTER TABLE IF EXISTS ONLY public.time_slots DROP CONSTRAINT IF EXISTS time_slots_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_code_key;
ALTER TABLE IF EXISTS ONLY public.faculty_subjects DROP CONSTRAINT IF EXISTS faculty_subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS faculty_pkey;
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS faculty_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_pkey;
ALTER TABLE IF EXISTS ONLY public.class_subjects DROP CONSTRAINT IF EXISTS class_subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_tables ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_slots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subjects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.faculty ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.classes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.branches ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.time_tables_id_seq;
DROP TABLE IF EXISTS public.time_tables;
DROP SEQUENCE IF EXISTS public.time_slots_id_seq;
DROP TABLE IF EXISTS public.time_slots;
DROP SEQUENCE IF EXISTS public.subjects_id_seq;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.faculty_subjects;
DROP SEQUENCE IF EXISTS public.faculty_id_seq;
DROP TABLE IF EXISTS public.faculty;
DROP SEQUENCE IF EXISTS public.classes_id_seq;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.class_subjects;
DROP SEQUENCE IF EXISTS public.branches_id_seq;
DROP TABLE IF EXISTS public.branches;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: class_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_subjects (
    class_id integer NOT NULL,
    subject_id integer NOT NULL
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    branch_id integer NOT NULL,
    year integer NOT NULL,
    semester integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty (
    id integer NOT NULL,
    employee_id character varying(30) NOT NULL,
    full_name character varying(120) NOT NULL,
    email character varying(120) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faculty_id_seq OWNED BY public.faculty.id;


--
-- Name: faculty_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty_subjects (
    faculty_id integer NOT NULL,
    subject_id integer NOT NULL
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(150) NOT NULL,
    credits integer DEFAULT 0,
    weekly_hours integer DEFAULT 0,
    type character varying(20) DEFAULT 'THEORY'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_slots (
    id integer NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    slot_label character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: time_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: time_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_slots_id_seq OWNED BY public.time_slots.id;


--
-- Name: time_tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_tables (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    subject_id integer NOT NULL,
    faculty_id integer NOT NULL,
    class_id integer NOT NULL,
    time_slot_id integer NOT NULL,
    academic_year character varying(20) NOT NULL,
    semester character varying(20) NOT NULL,
    variation integer DEFAULT 1,
    status character varying(20) DEFAULT 'DRAFT'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: time_tables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: time_tables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_tables_id_seq OWNED BY public.time_tables.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(80) NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(120),
    role character varying(20) DEFAULT 'USER'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: faculty id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty ALTER COLUMN id SET DEFAULT nextval('public.faculty_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: time_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots ALTER COLUMN id SET DEFAULT nextval('public.time_slots_id_seq'::regclass);


--
-- Name: time_tables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables ALTER COLUMN id SET DEFAULT nextval('public.time_tables_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, name, created_at) FROM stdin;
1	AIML	2026-04-10 23:10:31.768938
2	ECE	2026-04-10 23:10:31.768938
3	CIVIL	2026-04-10 23:10:31.768938
\.


--
-- Data for Name: class_subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.class_subjects (class_id, subject_id) FROM stdin;
1	1
1	2
1	8
1	9
1	6
1	10
1	4
1	5
1	7
1	11
1	12
2	1
2	16
2	4
2	5
2	17
3	22
3	23
3	24
3	25
3	26
3	27
3	28
3	29
3	30
3	31
4	32
4	33
4	34
4	35
4	36
4	37
4	38
4	39
4	40
4	41
5	42
5	43
5	44
5	45
5	50
5	46
5	47
5	48
5	49
6	51
6	52
6	53
6	59
6	60
6	54
6	55
6	56
6	57
6	58
7	61
7	62
7	66
7	67
7	63
7	64
7	65
8	69
8	70
8	68
9	1
9	2
9	3
9	6
9	4
9	5
9	7
10	8
10	14
10	15
10	16
10	10
10	18
10	17
10	12
11	71
11	72
11	73
11	74
11	24
11	27
11	75
11	76
11	28
11	31
12	77
12	78
12	79
12	80
12	81
12	37
12	82
12	83
12	84
12	85
13	86
13	87
13	88
13	89
13	98
13	46
13	90
13	91
13	92
14	93
14	94
14	36
14	99
14	105
14	54
14	95
14	96
14	97
15	100
15	101
15	105
15	107
15	108
15	102
15	103
15	104
16	107
16	108
16	106
17	1
17	2
17	3
17	6
17	4
17	5
17	7
18	8
18	14
18	19
18	9
18	10
18	20
18	21
18	17
19	109
19	110
19	111
19	112
19	24
19	27
19	113
19	114
19	28
19	31
20	115
20	116
20	117
20	118
20	37
20	119
20	120
20	121
20	85
21	122
21	123
21	124
21	36
21	125
21	126
21	92
22	127
22	128
22	129
22	130
22	131
22	54
22	97
23	132
23	133
23	138
23	139
23	134
23	135
23	136
24	138
24	139
24	137
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.classes (id, name, branch_id, year, semester, created_at) FROM stdin;
1	AIML S1	1	1	1	2026-04-10 23:10:31.768938
2	AIML S2	1	1	2	2026-04-10 23:10:31.768938
3	AIML S3	1	2	3	2026-04-10 23:10:31.768938
4	AIML S4	1	2	4	2026-04-10 23:10:31.768938
5	AIML S5	1	3	5	2026-04-10 23:10:31.768938
6	AIML S6	1	3	6	2026-04-10 23:10:31.768938
7	AIML S7	1	4	7	2026-04-10 23:10:31.768938
8	AIML S8	1	4	8	2026-04-10 23:10:31.768938
9	ECE S1	2	1	1	2026-04-10 23:10:31.768938
10	ECE S2	2	1	2	2026-04-10 23:10:31.768938
11	ECE S3	2	2	3	2026-04-10 23:10:31.768938
12	ECE S4	2	2	4	2026-04-10 23:10:31.768938
13	ECE S5	2	3	5	2026-04-10 23:10:31.768938
14	ECE S6	2	3	6	2026-04-10 23:10:31.768938
15	ECE S7	2	4	7	2026-04-10 23:10:31.768938
16	ECE S8	2	4	8	2026-04-10 23:10:31.768938
17	CIVIL S1	3	1	1	2026-04-10 23:10:31.768938
18	CIVIL S2	3	1	2	2026-04-10 23:10:31.768938
19	CIVIL S3	3	2	3	2026-04-10 23:10:31.768938
20	CIVIL S4	3	2	4	2026-04-10 23:10:31.768938
21	CIVIL S5	3	3	5	2026-04-10 23:10:31.768938
22	CIVIL S6	3	3	6	2026-04-10 23:10:31.768938
23	CIVIL S7	3	4	7	2026-04-10 23:10:31.768938
24	CIVIL S8	3	4	8	2026-04-10 23:10:31.768938
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty (id, employee_id, full_name, email, created_at) FROM stdin;
1	CSE001	Dr. Anand Kumar	anand.kumar@campus.edu	2026-04-10 23:10:31.768938
2	CSE002	Dr. Priya Venkatesh	priya.v@campus.edu	2026-04-10 23:10:31.768938
3	CSE003	Prof. Ramesh Babu	ramesh.b@campus.edu	2026-04-10 23:10:31.768938
4	CSE004	Dr. Kavitha Srinivas	kavitha.s@campus.edu	2026-04-10 23:10:31.768938
5	CSE005	Prof. Srinivas Reddy	srinivas.r@campus.edu	2026-04-10 23:10:31.768938
6	CSE006	Dr. Deepa Nair	deepa.n@campus.edu	2026-04-10 23:10:31.768938
7	CSE007	Prof. Mohan Das	mohan.d@campus.edu	2026-04-10 23:10:31.768938
8	CSE008	Dr. Shalini Gupta	shalini.g@campus.edu	2026-04-10 23:10:31.768938
9	CSE009	Prof. Karthik Rajan	karthik.r@campus.edu	2026-04-10 23:10:31.768938
10	CSE010	Dr. Meena Kumari	meena.k@campus.edu	2026-04-10 23:10:31.768938
11	CSE011	Prof. Arjun Mehta	arjun.m@campus.edu	2026-04-10 23:10:31.768938
12	CSE012	Dr. Nithya Raman	nithya.r@campus.edu	2026-04-10 23:10:31.768938
13	ECE001	Dr. Lakshmi Devi	lakshmi.d@campus.edu	2026-04-10 23:10:31.768938
14	ECE002	Prof. Rajesh Kulkarni	rajesh.k@campus.edu	2026-04-10 23:10:31.768938
15	ECE003	Dr. Sunitha Menon	sunitha.m@campus.edu	2026-04-10 23:10:31.768938
16	ECE004	Prof. Girish Patil	girish.p@campus.edu	2026-04-10 23:10:31.768938
17	ECE005	Dr. Padmavathi Iyer	padma.i@campus.edu	2026-04-10 23:10:31.768938
18	ECE006	Prof. Harish Chandra	harish.c@campus.edu	2026-04-10 23:10:31.768938
19	ECE007	Dr. Bhavani Shankar	bhavani.s@campus.edu	2026-04-10 23:10:31.768938
20	ECE008	Prof. Divya Prakash	divya.p@campus.edu	2026-04-10 23:10:31.768938
21	ECE009	Dr. Vasanth Kumar	vasanth.k@campus.edu	2026-04-10 23:10:31.768938
22	ECE010	Prof. Rekha Joshi	rekha.j@campus.edu	2026-04-10 23:10:31.768938
23	CIV001	Prof. Venkateshwara Rao	venkat.rao@campus.edu	2026-04-10 23:10:31.768938
24	CIV002	Dr. Nagarjuna Reddy	nagarjuna.r@campus.edu	2026-04-10 23:10:31.768938
25	CIV003	Prof. Sujatha Rani	sujatha.r@campus.edu	2026-04-10 23:10:31.768938
26	CIV004	Dr. Kiran Chandra	kiran.c@campus.edu	2026-04-10 23:10:31.768938
27	CIV005	Prof. Padma Priya	padma.p@campus.edu	2026-04-10 23:10:31.768938
28	CIV006	Dr. Ravi Shankar	ravi.s@campus.edu	2026-04-10 23:10:31.768938
29	CIV007	Prof. Annapurna Devi	anna.d@campus.edu	2026-04-10 23:10:31.768938
30	CIV008	Dr. Mahesh Varma	mahesh.v@campus.edu	2026-04-10 23:10:31.768938
31	HSS001	Dr. Raghavendra Sharma	raghav.s@campus.edu	2026-04-10 23:10:31.768938
32	HSS002	Prof. Usha Krishnan	usha.k@campus.edu	2026-04-10 23:10:31.768938
33	HSS003	Dr. Balasubramanian	bala.s@campus.edu	2026-04-10 23:10:31.768938
34	HSS004	Prof. Saroja Devi	saroja.d@campus.edu	2026-04-10 23:10:31.768938
35	HSS005	Dr. Narayana Swamy	narayana.s@campus.edu	2026-04-10 23:10:31.768938
36	HSS006	Prof. Jayalakshmi	jaya.l@campus.edu	2026-04-10 23:10:31.768938
37	HSS007	Dr. Prakash Rao	prakash.r@campus.edu	2026-04-10 23:10:31.768938
38	ME001	Prof. Subramanyam	subra.m@campus.edu	2026-04-10 23:10:31.768938
39	ME002	Dr. Durga Prasad	durga.p@campus.edu	2026-04-10 23:10:31.768938
40	ME003	Prof. Shankar Reddy	shankar.r@campus.edu	2026-04-10 23:10:31.768938
41	EEE001	Dr. Chandrasekhar	chandra.s@campus.edu	2026-04-10 23:10:31.768938
42	EEE002	Prof. Lalitha Kumari	lalitha.k@campus.edu	2026-04-10 23:10:31.768938
\.


--
-- Data for Name: faculty_subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty_subjects (faculty_id, subject_id) FROM stdin;
31	2
31	14
31	22
31	77
32	1
32	4
32	8
33	3
33	13
33	5
34	1
34	4
35	2
35	14
36	31
36	41
36	36
37	8
37	3
1	6
1	7
1	16
1	17
2	24
2	28
2	35
2	39
3	23
3	32
3	33
4	25
4	29
4	44
4	47
5	34
5	38
5	85
6	42
6	53
6	26
7	43
7	30
7	6
8	45
8	48
8	46
8	10
9	51
9	55
9	50
9	59
10	52
10	56
10	54
11	61
11	63
11	62
11	64
12	40
12	57
12	58
12	49
9	60
9	66
9	67
6	69
6	70
13	71
13	75
13	78
13	82
14	72
14	94
14	96
15	73
15	76
15	79
15	83
16	74
16	80
16	93
16	95
17	81
17	84
17	86
17	100
18	87
18	91
18	101
18	103
19	88
19	89
19	90
20	26
20	9
20	11
21	15
21	18
21	104
21	106
22	98
22	99
22	105
23	115
23	122
23	124
23	127
24	111
24	116
24	120
24	123
25	109
25	113
25	125
25	129
26	110
26	121
26	126
27	112
27	114
27	128
27	130
28	118
28	119
28	117
28	133
29	19
29	132
29	135
29	136
30	131
30	134
30	137
38	12
38	19
39	20
39	12
40	21
40	20
41	9
41	11
41	15
41	18
42	89
42	9
42	26
1	27
1	37
13	27
23	27
23	37
2	92
2	97
2	49
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subjects (id, code, name, credits, weekly_hours, type, created_at) FROM stdin;
1	AHSC01	English	3	3	THEORY	2026-04-10 23:10:31.768938
2	AHSC02	Linear Algebra and Calculus	4	4	THEORY	2026-04-10 23:10:31.768938
3	AHSC03	Engineering Physics	4	4	THEORY	2026-04-10 23:10:31.768938
4	AHSC04	English Language and Communication Skills Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
5	AHSC05	Physics Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
6	ACSC01	Python Programming	3	3	THEORY	2026-04-10 23:10:31.768938
7	ACSC02	Python Programming Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
8	AHSC06	Chemistry	4	4	THEORY	2026-04-10 23:10:31.768938
9	AEEC01	Basic Electrical Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
10	ACSC06	Experiential Engineering Education - Academic Success	1	2	THEORY	2026-04-10 23:10:31.768938
11	AEEC04	Basic Electrical Engineering Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
12	AMEC04	Engineering Workshop Practice	2	3	LAB	2026-04-10 23:10:31.768938
13	AHSC03B	Applied Physics	4	4	THEORY	2026-04-10 23:10:31.768938
14	AHSC07	Mathematical Transform Techniques	4	4	THEORY	2026-04-10 23:10:31.768938
15	AEEC02	Electrical Circuits	3	3	THEORY	2026-04-10 23:10:31.768938
16	ACSC04	Programming for Problem Solving using C	3	3	THEORY	2026-04-10 23:10:31.768938
17	ACSC05	Programming for Problem Solving using C Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
18	AEEC03	Electrical Circuits Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
19	AMEC01	Engineering Mechanics	4	4	THEORY	2026-04-10 23:10:31.768938
20	AMEC02	Manufacturing Practice	2	3	LAB	2026-04-10 23:10:31.768938
21	AMEC03	Computer Aided Engineering Drawing	2	3	LAB	2026-04-10 23:10:31.768938
22	AITC01	Discrete Mathematical Structures	3	3	THEORY	2026-04-10 23:10:31.768938
23	ACSC07	Computer Organization and Architecture	3	3	THEORY	2026-04-10 23:10:31.768938
24	ACSC08	Data Structures	3	3	THEORY	2026-04-10 23:10:31.768938
25	AITC02	Programming with Objects	3	3	THEORY	2026-04-10 23:10:31.768938
26	AECC08	Analog and Digital Electronics	3	3	THEORY	2026-04-10 23:10:31.768938
27	ACSC09	Experiential Engineering Education - Prototype/Design Building	1	2	THEORY	2026-04-10 23:10:31.768938
28	ACSC10	Data Structures Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
29	AITC03	Programming with Objects Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
30	ACSC11	Advanced Python Programming Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
31	AHSC10	Essence of Indian Traditional Knowledge	1	2	THEORY	2026-04-10 23:10:31.768938
32	AITC04	Theory of Computation	3	3	THEORY	2026-04-10 23:10:31.768938
33	ACSC12	Operating Systems	3	3	THEORY	2026-04-10 23:10:31.768938
34	AITC05	Database Management Systems	3	3	THEORY	2026-04-10 23:10:31.768938
35	ACSC13	Design and Analysis of Algorithms	3	3	THEORY	2026-04-10 23:10:31.768938
36	AHSC13	Business Economics and Financial Analysis	3	3	THEORY	2026-04-10 23:10:31.768938
37	ACSC14	Experiential Engineering Education - Fabrication/Model Development	1	2	THEORY	2026-04-10 23:10:31.768938
38	AITC07	Database Management Systems Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
39	ACSC15	Design and Analysis of Algorithms Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
40	ACSC16	Linux Programming Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
41	AHSC14	Indian Constitution	1	2	THEORY	2026-04-10 23:10:31.768938
42	AITC06	Computer Networks	3	3	THEORY	2026-04-10 23:10:31.768938
43	ACSC40	Compiler Design	3	3	THEORY	2026-04-10 23:10:31.768938
44	ACSC19	Object Oriented Software Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
45	AITC09	Web Application Development	3	3	THEORY	2026-04-10 23:10:31.768938
46	ACSC20	Experiential Engineering Education - Project Based Learning	1	2	THEORY	2026-04-10 23:10:31.768938
47	ACSC21	Object Oriented Software Design Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
48	AITC10	Web Application Development Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
49	ACSC22	Competitive Programming using Graph Algorithms	1	2	THEORY	2026-04-10 23:10:31.768938
50	ACPE01	Machine Learning	3	3	THEORY	2026-04-10 23:10:31.768938
51	ACIC01	Data Mining and Knowledge Discovery	3	3	THEORY	2026-04-10 23:10:31.768938
52	ACIC02	Software Quality Assurance and Testing	3	3	THEORY	2026-04-10 23:10:31.768938
53	ACIC03	Network and Web Security	3	3	THEORY	2026-04-10 23:10:31.768938
54	ACSC27	Experiential Engineering Education - Research Based Learning	1	2	THEORY	2026-04-10 23:10:31.768938
55	ACIC08	Data Mining and Knowledge Discovery Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
56	ACIC09	Software Testing Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
57	ACSC28	Go Programming	1	2	THEORY	2026-04-10 23:10:31.768938
58	ACSC42	DevOps	1	2	THEORY	2026-04-10 23:10:31.768938
59	ACPE02	Deep Learning	3	3	THEORY	2026-04-10 23:10:31.768938
60	ACPE03	Natural Language Processing	3	3	THEORY	2026-04-10 23:10:31.768938
61	ACSC30	Cloud Application Development	3	3	THEORY	2026-04-10 23:10:31.768938
62	ACSC31	Big Data and Analytics	3	3	THEORY	2026-04-10 23:10:31.768938
63	ACSC33	Cloud Application Development Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
64	ACSC34	Big Data and Analytics Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
65	ACSC35	Project Work Phase I	4	6	LAB	2026-04-10 23:10:31.768938
66	ACPE04	Artificial Intelligence	3	3	THEORY	2026-04-10 23:10:31.768938
67	ACPE05	Computer Vision	3	3	THEORY	2026-04-10 23:10:31.768938
68	ACSC39	Project Work Phase II	8	12	LAB	2026-04-10 23:10:31.768938
69	ACPE06	Reinforcement Learning	3	3	THEORY	2026-04-10 23:10:31.768938
70	ACPE07	Blockchain Technology	3	3	THEORY	2026-04-10 23:10:31.768938
71	AECC01	Electronic Devices and Circuits	3	3	THEORY	2026-04-10 23:10:31.768938
72	AECC02	Signals and Systems	3	3	THEORY	2026-04-10 23:10:31.768938
73	AECC03	Digital System Design	3	3	THEORY	2026-04-10 23:10:31.768938
74	AECC04	Probability Theory and Stochastic Processes	3	3	THEORY	2026-04-10 23:10:31.768938
75	AECC05	Electronic Devices and Circuits Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
76	AECC06	Digital System Design Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
77	AHSC12	Complex Analysis and Special Functions	4	4	THEORY	2026-04-10 23:10:31.768938
78	AECC09	Analog and Pulse Circuits	3	3	THEORY	2026-04-10 23:10:31.768938
79	AECC10	Analog and Digital Communications	3	3	THEORY	2026-04-10 23:10:31.768938
80	AECC11	Electromagnetic Waves and Transmission Lines	3	3	THEORY	2026-04-10 23:10:31.768938
81	AECC12	IC Applications	3	3	THEORY	2026-04-10 23:10:31.768938
82	AECC13	Analog and Pulse Circuits Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
83	AECC14	Analog and Digital Communications Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
84	AECC15	IC Applications Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
85	ACSC18	Fundamentals of Database Systems	1	2	THEORY	2026-04-10 23:10:31.768938
86	AECC18	Antennas and Wave Propagation	3	3	THEORY	2026-04-10 23:10:31.768938
87	AECC19	Microprocessors and Microcontrollers	3	3	THEORY	2026-04-10 23:10:31.768938
88	AECC20	Electronic Measurements and Instrumentation	3	3	THEORY	2026-04-10 23:10:31.768938
89	AECC21	Control Systems	3	3	THEORY	2026-04-10 23:10:31.768938
90	AECC30	Virtual Instrumentation Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
91	AECC31	Microprocessors and Microcontrollers Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
92	ACSC23	Object Oriented Programming Development and Languages	1	2	THEORY	2026-04-10 23:10:31.768938
93	AECC32	Microwave and Radar Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
94	AECC33	Digital Signal Processing	3	3	THEORY	2026-04-10 23:10:31.768938
95	AECC41	Antennas and Microwave Engineering Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
96	AECC42	Digital Signal Processing Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
97	ACSC29	Design of Algorithms	1	2	THEORY	2026-04-10 23:10:31.768938
98	AEPE01	VLSI Signal Processing	3	3	THEORY	2026-04-10 23:10:31.768938
99	AEPE02	Wireless Communications	3	3	THEORY	2026-04-10 23:10:31.768938
100	AECC43	Embedded System Design	3	3	THEORY	2026-04-10 23:10:31.768938
101	AECC44	VLSI Design	3	3	THEORY	2026-04-10 23:10:31.768938
102	AECC53	Embedded System Design Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
103	AECC54	VLSI Design Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
104	AECC55	Project Work Phase I	4	6	LAB	2026-04-10 23:10:31.768938
105	AEPE03	IoT Systems	3	3	THEORY	2026-04-10 23:10:31.768938
106	AECC64	Project Work Phase II	8	12	LAB	2026-04-10 23:10:31.768938
107	AEPE04	Satellite Communications	3	3	THEORY	2026-04-10 23:10:31.768938
108	AEPE05	Optical Communications	3	3	THEORY	2026-04-10 23:10:31.768938
109	ACEC01	Surveying and Geomatics	3	3	THEORY	2026-04-10 23:10:31.768938
110	ACEC02	Strength of Materials	4	4	THEORY	2026-04-10 23:10:31.768938
111	ACEC03	Fluid Mechanics	4	4	THEORY	2026-04-10 23:10:31.768938
112	ACEC04	Engineering Geology	3	3	THEORY	2026-04-10 23:10:31.768938
113	ACEC05	Surveying and Geomatics Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
114	ACEC06	Engineering Geology Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
115	ACEC07	Theory of Structures	4	4	THEORY	2026-04-10 23:10:31.768938
116	ACEC08	Hydraulics and Hydraulic Machinery	4	4	THEORY	2026-04-10 23:10:31.768938
117	ACEC09	Building Materials - Planning and Construction	3	3	THEORY	2026-04-10 23:10:31.768938
118	ACEC10	Concrete Technology	3	3	THEORY	2026-04-10 23:10:31.768938
119	ACEC11	Concrete Technology Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
120	ACEC12	Hydraulics and Hydraulic Machinery Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
121	ACEC13	Strength of Materials Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
122	ACEC14	Analysis of Structures	4	4	THEORY	2026-04-10 23:10:31.768938
123	ACEC15	Hydrology and Water Resources Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
124	ACEC16	Reinforced Concrete Structures Design and Drawing	4	4	THEORY	2026-04-10 23:10:31.768938
125	ACEC21	Advanced Surveying Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
126	ACEC22	Advanced Material Testing Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
127	ACEC23	Steel Structures Design and Drawing	4	4	THEORY	2026-04-10 23:10:31.768938
128	ACEC24	Geotechnical Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
129	ACEC25	Transportation Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
130	ACEC32	Geotechnical Engineering Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
131	ACEC33	Transportation Engineering Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
132	ACEC34	Environmental Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
133	ACEC35	Foundation Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
134	ACEC44	Advanced Structural Design Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
135	ACEC45	Project Planning Laboratory	2	3	LAB	2026-04-10 23:10:31.768938
136	ACEC46	Project Work Phase I	4	6	LAB	2026-04-10 23:10:31.768938
137	ACEC55	Project Work Phase II	8	12	LAB	2026-04-10 23:10:31.768938
138	ACPE08	Earthquake Engineering	3	3	THEORY	2026-04-10 23:10:31.768938
139	ACPE09	Green Building Technology	3	3	THEORY	2026-04-10 23:10:31.768938
\.


--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_slots (id, day_of_week, start_time, end_time, slot_label, created_at) FROM stdin;
1	1	09:00:00	09:55:00	9:00 AM - 9:55 AM	2026-04-10 23:10:31.768938
2	1	10:00:00	10:55:00	10:00 AM - 10:55 AM	2026-04-10 23:10:31.768938
3	1	11:00:00	11:55:00	11:00 AM - 11:55 AM	2026-04-10 23:10:31.768938
4	1	12:00:00	12:55:00	12:00 PM - 12:55 PM	2026-04-10 23:10:31.768938
5	1	14:00:00	15:55:00	2:00 PM - 3:55 PM (Lab)	2026-04-10 23:10:31.768938
6	1	16:00:00	17:55:00	4:00 PM - 5:55 PM (Lab)	2026-04-10 23:10:31.768938
7	2	09:00:00	09:55:00	9:00 AM - 9:55 AM	2026-04-10 23:10:31.768938
8	2	10:00:00	10:55:00	10:00 AM - 10:55 AM	2026-04-10 23:10:31.768938
9	2	11:00:00	11:55:00	11:00 AM - 11:55 AM	2026-04-10 23:10:31.768938
10	2	12:00:00	12:55:00	12:00 PM - 12:55 PM	2026-04-10 23:10:31.768938
11	2	14:00:00	15:55:00	2:00 PM - 3:55 PM (Lab)	2026-04-10 23:10:31.768938
12	2	16:00:00	17:55:00	4:00 PM - 5:55 PM (Lab)	2026-04-10 23:10:31.768938
13	3	09:00:00	09:55:00	9:00 AM - 9:55 AM	2026-04-10 23:10:31.768938
14	3	10:00:00	10:55:00	10:00 AM - 10:55 AM	2026-04-10 23:10:31.768938
15	3	11:00:00	11:55:00	11:00 AM - 11:55 AM	2026-04-10 23:10:31.768938
16	3	12:00:00	12:55:00	12:00 PM - 12:55 PM	2026-04-10 23:10:31.768938
17	3	14:00:00	15:55:00	2:00 PM - 3:55 PM (Lab)	2026-04-10 23:10:31.768938
18	3	16:00:00	17:55:00	4:00 PM - 5:55 PM (Lab)	2026-04-10 23:10:31.768938
19	4	09:00:00	09:55:00	9:00 AM - 9:55 AM	2026-04-10 23:10:31.768938
20	4	10:00:00	10:55:00	10:00 AM - 10:55 AM	2026-04-10 23:10:31.768938
21	4	11:00:00	11:55:00	11:00 AM - 11:55 AM	2026-04-10 23:10:31.768938
22	4	12:00:00	12:55:00	12:00 PM - 12:55 PM	2026-04-10 23:10:31.768938
23	4	14:00:00	15:55:00	2:00 PM - 3:55 PM (Lab)	2026-04-10 23:10:31.768938
24	4	16:00:00	17:55:00	4:00 PM - 5:55 PM (Lab)	2026-04-10 23:10:31.768938
25	5	09:00:00	09:55:00	9:00 AM - 9:55 AM	2026-04-10 23:10:31.768938
26	5	10:00:00	10:55:00	10:00 AM - 10:55 AM	2026-04-10 23:10:31.768938
27	5	11:00:00	11:55:00	11:00 AM - 11:55 AM	2026-04-10 23:10:31.768938
28	5	12:00:00	12:55:00	12:00 PM - 12:55 PM	2026-04-10 23:10:31.768938
29	5	14:00:00	15:55:00	2:00 PM - 3:55 PM (Lab)	2026-04-10 23:10:31.768938
30	5	16:00:00	17:55:00	4:00 PM - 5:55 PM (Lab)	2026-04-10 23:10:31.768938
31	6	09:00:00	09:55:00	9:00 AM - 9:55 AM	2026-04-10 23:10:31.768938
32	6	10:00:00	10:55:00	10:00 AM - 10:55 AM	2026-04-10 23:10:31.768938
33	6	11:00:00	11:55:00	11:00 AM - 11:55 AM	2026-04-10 23:10:31.768938
34	6	12:00:00	12:55:00	12:00 PM - 12:55 PM	2026-04-10 23:10:31.768938
35	6	14:00:00	15:55:00	2:00 PM - 3:55 PM (Lab)	2026-04-10 23:10:31.768938
36	6	16:00:00	17:55:00	4:00 PM - 5:55 PM (Lab)	2026-04-10 23:10:31.768938
\.


--
-- Data for Name: time_tables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_tables (id, branch_id, subject_id, faculty_id, class_id, time_slot_id, academic_year, semester, variation, status, created_at, updated_at) FROM stdin;
1	1	8	32	1	1	2024-25	1	1	DRAFT	2026-04-10 23:12:16.179463	2026-04-10 23:12:16.179463
2	1	8	32	1	7	2024-25	1	1	DRAFT	2026-04-10 23:12:16.189879	2026-04-10 23:12:16.189879
3	1	8	32	1	13	2024-25	1	1	DRAFT	2026-04-10 23:12:16.19718	2026-04-10 23:12:16.19718
4	1	8	32	1	19	2024-25	1	1	DRAFT	2026-04-10 23:12:16.204058	2026-04-10 23:12:16.204058
5	1	2	31	1	25	2024-25	1	1	DRAFT	2026-04-10 23:12:16.209404	2026-04-10 23:12:16.209404
6	1	2	31	1	31	2024-25	1	1	DRAFT	2026-04-10 23:12:16.21404	2026-04-10 23:12:16.21404
7	1	2	31	1	2	2024-25	1	1	DRAFT	2026-04-10 23:12:16.218431	2026-04-10 23:12:16.218431
8	1	2	31	1	8	2024-25	1	1	DRAFT	2026-04-10 23:12:16.221674	2026-04-10 23:12:16.221674
9	1	9	20	1	14	2024-25	1	1	DRAFT	2026-04-10 23:12:16.224695	2026-04-10 23:12:16.224695
10	1	9	20	1	20	2024-25	1	1	DRAFT	2026-04-10 23:12:16.227745	2026-04-10 23:12:16.227745
11	1	9	20	1	26	2024-25	1	1	DRAFT	2026-04-10 23:12:16.231165	2026-04-10 23:12:16.231165
12	1	6	1	1	32	2024-25	1	1	DRAFT	2026-04-10 23:12:16.23533	2026-04-10 23:12:16.23533
13	1	6	1	1	3	2024-25	1	1	DRAFT	2026-04-10 23:12:16.239263	2026-04-10 23:12:16.239263
14	1	6	1	1	9	2024-25	1	1	DRAFT	2026-04-10 23:12:16.243861	2026-04-10 23:12:16.243861
15	1	1	32	1	15	2024-25	1	1	DRAFT	2026-04-10 23:12:16.247897	2026-04-10 23:12:16.247897
16	1	1	32	1	21	2024-25	1	1	DRAFT	2026-04-10 23:12:16.25148	2026-04-10 23:12:16.25148
17	1	1	32	1	27	2024-25	1	1	DRAFT	2026-04-10 23:12:16.254751	2026-04-10 23:12:16.254751
18	1	10	8	1	33	2024-25	1	1	DRAFT	2026-04-10 23:12:16.257811	2026-04-10 23:12:16.257811
19	1	10	8	1	4	2024-25	1	1	DRAFT	2026-04-10 23:12:16.260976	2026-04-10 23:12:16.260976
20	1	12	38	1	10	2024-25	1	1	DRAFT	2026-04-10 23:12:16.264144	2026-04-10 23:12:16.264144
21	1	12	38	1	16	2024-25	1	1	DRAFT	2026-04-10 23:12:16.267845	2026-04-10 23:12:16.267845
22	1	12	38	1	22	2024-25	1	1	DRAFT	2026-04-10 23:12:16.271411	2026-04-10 23:12:16.271411
23	1	4	32	1	28	2024-25	1	1	DRAFT	2026-04-10 23:12:16.276389	2026-04-10 23:12:16.276389
24	1	4	32	1	34	2024-25	1	1	DRAFT	2026-04-10 23:12:16.281336	2026-04-10 23:12:16.281336
25	1	4	32	1	5	2024-25	1	1	DRAFT	2026-04-10 23:12:16.287023	2026-04-10 23:12:16.287023
26	1	5	33	1	11	2024-25	1	1	DRAFT	2026-04-10 23:12:16.290742	2026-04-10 23:12:16.290742
27	1	5	33	1	17	2024-25	1	1	DRAFT	2026-04-10 23:12:16.293837	2026-04-10 23:12:16.293837
28	1	5	33	1	23	2024-25	1	1	DRAFT	2026-04-10 23:12:16.297199	2026-04-10 23:12:16.297199
29	1	7	1	1	29	2024-25	1	1	DRAFT	2026-04-10 23:12:16.300778	2026-04-10 23:12:16.300778
30	1	7	1	1	35	2024-25	1	1	DRAFT	2026-04-10 23:12:16.303904	2026-04-10 23:12:16.303904
31	1	7	1	1	6	2024-25	1	1	DRAFT	2026-04-10 23:12:16.307146	2026-04-10 23:12:16.307146
32	1	11	20	1	12	2024-25	1	1	DRAFT	2026-04-10 23:12:16.310635	2026-04-10 23:12:16.310635
33	1	11	20	1	18	2024-25	1	1	DRAFT	2026-04-10 23:12:16.315937	2026-04-10 23:12:16.315937
34	1	11	20	1	24	2024-25	1	1	DRAFT	2026-04-10 23:12:16.321173	2026-04-10 23:12:16.321173
35	1	33	3	4	1	2024-25	4	1	DRAFT	2026-04-10 23:12:31.812499	2026-04-10 23:12:31.812499
36	1	33	3	4	7	2024-25	4	1	DRAFT	2026-04-10 23:12:31.818015	2026-04-10 23:12:31.818015
37	1	33	3	4	13	2024-25	4	1	DRAFT	2026-04-10 23:12:31.826008	2026-04-10 23:12:31.826008
38	1	32	3	4	19	2024-25	4	1	DRAFT	2026-04-10 23:12:31.836231	2026-04-10 23:12:31.836231
39	1	32	3	4	25	2024-25	4	1	DRAFT	2026-04-10 23:12:31.843205	2026-04-10 23:12:31.843205
40	1	32	3	4	31	2024-25	4	1	DRAFT	2026-04-10 23:12:31.846961	2026-04-10 23:12:31.846961
41	1	34	5	4	2	2024-25	4	1	DRAFT	2026-04-10 23:12:31.850144	2026-04-10 23:12:31.850144
42	1	34	5	4	8	2024-25	4	1	DRAFT	2026-04-10 23:12:31.853458	2026-04-10 23:12:31.853458
43	1	34	5	4	14	2024-25	4	1	DRAFT	2026-04-10 23:12:31.858808	2026-04-10 23:12:31.858808
44	1	35	2	4	20	2024-25	4	1	DRAFT	2026-04-10 23:12:31.864834	2026-04-10 23:12:31.864834
45	1	35	2	4	26	2024-25	4	1	DRAFT	2026-04-10 23:12:31.870206	2026-04-10 23:12:31.870206
46	1	35	2	4	32	2024-25	4	1	DRAFT	2026-04-10 23:12:31.874905	2026-04-10 23:12:31.874905
47	1	36	36	4	3	2024-25	4	1	DRAFT	2026-04-10 23:12:31.881774	2026-04-10 23:12:31.881774
48	1	36	36	4	9	2024-25	4	1	DRAFT	2026-04-10 23:12:31.886342	2026-04-10 23:12:31.886342
49	1	36	36	4	15	2024-25	4	1	DRAFT	2026-04-10 23:12:31.891087	2026-04-10 23:12:31.891087
50	1	41	36	4	21	2024-25	4	1	DRAFT	2026-04-10 23:12:31.896388	2026-04-10 23:12:31.896388
51	1	41	36	4	27	2024-25	4	1	DRAFT	2026-04-10 23:12:31.899583	2026-04-10 23:12:31.899583
52	1	37	1	4	33	2024-25	4	1	DRAFT	2026-04-10 23:12:31.902598	2026-04-10 23:12:31.902598
53	1	37	1	4	4	2024-25	4	1	DRAFT	2026-04-10 23:12:31.905814	2026-04-10 23:12:31.905814
54	1	39	2	4	10	2024-25	4	1	DRAFT	2026-04-10 23:12:31.911505	2026-04-10 23:12:31.911505
55	1	39	2	4	16	2024-25	4	1	DRAFT	2026-04-10 23:12:31.917039	2026-04-10 23:12:31.917039
56	1	39	2	4	22	2024-25	4	1	DRAFT	2026-04-10 23:12:31.922523	2026-04-10 23:12:31.922523
57	1	40	12	4	28	2024-25	4	1	DRAFT	2026-04-10 23:12:31.930099	2026-04-10 23:12:31.930099
58	1	40	12	4	34	2024-25	4	1	DRAFT	2026-04-10 23:12:31.934769	2026-04-10 23:12:31.934769
59	1	40	12	4	5	2024-25	4	1	DRAFT	2026-04-10 23:12:31.938001	2026-04-10 23:12:31.938001
60	1	38	5	4	11	2024-25	4	1	DRAFT	2026-04-10 23:12:31.942523	2026-04-10 23:12:31.942523
61	1	38	5	4	17	2024-25	4	1	DRAFT	2026-04-10 23:12:31.946441	2026-04-10 23:12:31.946441
62	1	38	5	4	23	2024-25	4	1	DRAFT	2026-04-10 23:12:31.94979	2026-04-10 23:12:31.94979
63	3	19	29	18	1	2024-25	2	1	DRAFT	2026-04-10 23:12:48.943675	2026-04-10 23:12:48.943675
64	3	19	29	18	7	2024-25	2	1	DRAFT	2026-04-10 23:12:48.948938	2026-04-10 23:12:48.948938
65	3	19	29	18	13	2024-25	2	1	DRAFT	2026-04-10 23:12:48.954062	2026-04-10 23:12:48.954062
66	3	19	29	18	19	2024-25	2	1	DRAFT	2026-04-10 23:12:48.959364	2026-04-10 23:12:48.959364
67	3	8	32	18	25	2024-25	2	1	DRAFT	2026-04-10 23:12:48.964336	2026-04-10 23:12:48.964336
68	3	8	32	18	31	2024-25	2	1	DRAFT	2026-04-10 23:12:48.96888	2026-04-10 23:12:48.96888
69	3	8	32	18	2	2024-25	2	1	DRAFT	2026-04-10 23:12:48.975388	2026-04-10 23:12:48.975388
70	3	8	32	18	8	2024-25	2	1	DRAFT	2026-04-10 23:12:48.980147	2026-04-10 23:12:48.980147
71	3	14	31	18	14	2024-25	2	1	DRAFT	2026-04-10 23:12:48.986541	2026-04-10 23:12:48.986541
72	3	14	31	18	20	2024-25	2	1	DRAFT	2026-04-10 23:12:48.990331	2026-04-10 23:12:48.990331
73	3	14	31	18	26	2024-25	2	1	DRAFT	2026-04-10 23:12:48.994221	2026-04-10 23:12:48.994221
74	3	14	31	18	32	2024-25	2	1	DRAFT	2026-04-10 23:12:48.999372	2026-04-10 23:12:48.999372
75	3	9	20	18	3	2024-25	2	1	DRAFT	2026-04-10 23:12:49.002736	2026-04-10 23:12:49.002736
76	3	9	20	18	9	2024-25	2	1	DRAFT	2026-04-10 23:12:49.005842	2026-04-10 23:12:49.005842
77	3	9	20	18	15	2024-25	2	1	DRAFT	2026-04-10 23:12:49.009153	2026-04-10 23:12:49.009153
78	3	10	8	18	21	2024-25	2	1	DRAFT	2026-04-10 23:12:49.014257	2026-04-10 23:12:49.014257
79	3	10	8	18	27	2024-25	2	1	DRAFT	2026-04-10 23:12:49.02142	2026-04-10 23:12:49.02142
80	3	21	40	18	33	2024-25	2	1	DRAFT	2026-04-10 23:12:49.026158	2026-04-10 23:12:49.026158
81	3	21	40	18	4	2024-25	2	1	DRAFT	2026-04-10 23:12:49.032903	2026-04-10 23:12:49.032903
82	3	21	40	18	10	2024-25	2	1	DRAFT	2026-04-10 23:12:49.036072	2026-04-10 23:12:49.036072
83	3	17	1	18	16	2024-25	2	1	DRAFT	2026-04-10 23:12:49.039022	2026-04-10 23:12:49.039022
84	3	17	1	18	22	2024-25	2	1	DRAFT	2026-04-10 23:12:49.042193	2026-04-10 23:12:49.042193
85	3	17	1	18	28	2024-25	2	1	DRAFT	2026-04-10 23:12:49.045727	2026-04-10 23:12:49.045727
86	3	20	39	18	34	2024-25	2	1	DRAFT	2026-04-10 23:12:49.048844	2026-04-10 23:12:49.048844
87	3	20	39	18	5	2024-25	2	1	DRAFT	2026-04-10 23:12:49.052427	2026-04-10 23:12:49.052427
88	3	20	39	18	11	2024-25	2	1	DRAFT	2026-04-10 23:12:49.056164	2026-04-10 23:12:49.056164
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password_hash, full_name, role, is_active, created_at, updated_at) FROM stdin;
1	admin	admin@campus.edu	$2b$10$pagxCWhkvz7beRyf4FsTd.ogz.5CH/zZhbaxVjDA5Dnd/emkyg3rm	Dr. Raghavendra Sharma	ADMIN	t	2026-04-10 23:10:31.768938	2026-04-10 23:10:31.768938
2	hod_cse	hod_cse@campus.edu	$2b$10$pagxCWhkvz7beRyf4FsTd.ogz.5CH/zZhbaxVjDA5Dnd/emkyg3rm	Dr. Anand Kumar	HOD	t	2026-04-10 23:10:31.768938	2026-04-10 23:10:31.768938
3	hod_ece	hod_ece@campus.edu	$2b$10$pagxCWhkvz7beRyf4FsTd.ogz.5CH/zZhbaxVjDA5Dnd/emkyg3rm	Dr. Lakshmi Devi	HOD	t	2026-04-10 23:10:31.768938	2026-04-10 23:10:31.768938
4	hod_civil	hod_civil@campus.edu	$2b$10$pagxCWhkvz7beRyf4FsTd.ogz.5CH/zZhbaxVjDA5Dnd/emkyg3rm	Prof. Venkateshwara Rao	HOD	t	2026-04-10 23:10:31.768938	2026-04-10 23:10:31.768938
5	principal	principal@campus.edu	$2b$10$pagxCWhkvz7beRyf4FsTd.ogz.5CH/zZhbaxVjDA5Dnd/emkyg3rm	Dr. Suresh Babu	PRINCIPAL	t	2026-04-10 23:10:31.768938	2026-04-10 23:10:31.768938
\.


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branches_id_seq', 3, true);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.classes_id_seq', 24, true);


--
-- Name: faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faculty_id_seq', 42, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subjects_id_seq', 139, true);


--
-- Name: time_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_slots_id_seq', 36, true);


--
-- Name: time_tables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_tables_id_seq', 88, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: class_subjects class_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_pkey PRIMARY KEY (class_id, subject_id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: faculty faculty_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_employee_id_key UNIQUE (employee_id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (id);


--
-- Name: faculty_subjects faculty_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_subjects
    ADD CONSTRAINT faculty_subjects_pkey PRIMARY KEY (faculty_id, subject_id);


--
-- Name: subjects subjects_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_key UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: time_tables time_tables_class_id_time_slot_id_academic_year_semester_va_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_class_id_time_slot_id_academic_year_semester_va_key UNIQUE (class_id, time_slot_id, academic_year, semester, variation);


--
-- Name: time_tables time_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_time_tables_branch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_tables_branch ON public.time_tables USING btree (branch_id);


--
-- Name: idx_time_tables_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_tables_class ON public.time_tables USING btree (class_id);


--
-- Name: idx_time_tables_faculty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_tables_faculty ON public.time_tables USING btree (faculty_id);


--
-- Name: idx_time_tables_time_slot; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_tables_time_slot ON public.time_tables USING btree (time_slot_id);


--
-- Name: class_subjects class_subjects_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: class_subjects class_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: classes classes_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: faculty_subjects faculty_subjects_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_subjects
    ADD CONSTRAINT faculty_subjects_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(id) ON DELETE CASCADE;


--
-- Name: faculty_subjects faculty_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_subjects
    ADD CONSTRAINT faculty_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: time_tables time_tables_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: time_tables time_tables_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: time_tables time_tables_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(id);


--
-- Name: time_tables time_tables_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: time_tables time_tables_time_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_tables
    ADD CONSTRAINT time_tables_time_slot_id_fkey FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(id);


--
-- PostgreSQL database dump complete
--

\unrestrict AvjSgxN5Pvg2Zes05SuOHiwNf4eO6kulaPvIelUfCnpYpesHPdlENigZaLAu8gs

