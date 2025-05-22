--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

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

--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (77, 'Капустина Василиса Игоревна', '78989898987', 'dfgfrgfh@mail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (87, 'Роман Никитин Николаевич', '74848556565', 'dfgdfgdfgh@mail.ru', '2025-05-22');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (90, 'уцкуцкуц', '74956565656', 'esrersertw@MAIL.RU', '2025-05-22');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (78, 'Морковкин Матвей Аркадьевич', '79545557536', 'dfgdfgfgd@mail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (79, 'Ромашкина Мария Михайловна', '78989898989', 'dfgdfh@mail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (80, 'Потапов Макар Тимофеевич', '78900145566', 'hgfgg@mail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (81, 'Филипова Дарья Сергеевна', '78901447523', 'gju7@mail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (82, 'Конев Евгений Иванович', '78656566565', 'ghfghgh@mail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (83, 'Пирогова Жанна аркадьевна', '78904478562', 'dfdsfdfs@,ail.ru', '2025-05-09');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (84, 'Сидоров Василий Михайлович', '75656565665', 'fsgertgegrt@mail.ru', '2025-05-10');
INSERT INTO public.clients (id, full_name, phone, email, registration_date) VALUES (86, 'Сидоров Артем Николаевич', '75556956565', 'aremN@mail.ru', '2025-05-21');


--
-- Data for Name: abonims; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (24, 86, '2025-05-21', '2025-06-21', 1, '2025-05-22 12:17:12.829761', 1);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (25, 82, '2025-05-22', '2025-06-22', 8, '2025-05-22 17:03:00.338115', 0);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (26, 87, '2025-06-06', '2025-07-06', 2, '2025-05-22 17:14:23.559707', 2);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (23, 78, '2025-05-22', '2025-06-22', 4, '2025-05-22 06:49:34.866509', 3);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (27, 80, '2025-05-25', '2025-06-25', 7, '2025-05-22 17:17:14.915255', 2);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (10, 77, '2025-05-31', '2025-07-01', 5, '2025-05-21 15:26:38.013299', 2);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (12, 81, '2025-05-23', '2025-06-23', 5, '2025-05-21 16:22:44.04188', 2);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (8, 80, '2025-05-24', '2025-06-24', 5, '2025-05-21 15:26:22.213697', 2);
INSERT INTO public.abonims (id, client_id, start_date, end_date, visit_count, created_at, visited_count) VALUES (15, 83, '2025-05-22', '2025-06-22', 2, '2025-05-22 04:20:38.527202', 1);


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (52, 'Компьютерная графика', 'Фотошоп', 5, '2025-05-17 06:45:02.339016');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (53, 'Вышивание', 'На пяльцах, крестиком', 12, '2025-05-17 06:45:14.034438');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (55, 'Бисероплетение', 'Леска, проволока', 15, '2025-05-17 06:45:45.092173');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (56, 'Витраж', 'витражные краски', 5, '2025-05-17 06:45:59.275852');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (57, 'Натюрморт', 'Масло, акварель', 20, '2025-05-17 06:46:21.986541');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (69, 'Портрет', 'Масло, Гуашь', 10, '2025-05-20 02:41:04.692721');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (59, 'Квиллинг', 'Бумага', 12, '2025-05-17 06:47:09.275784');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (60, 'Выжег по дереву', 'Дерево', 8, '2025-05-17 06:47:29.795056');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (62, 'Батик', 'по ткани', 10, '2025-05-17 06:49:12.418878');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (63, 'Роспись', 'керамика, дерево', 15, '2025-05-17 06:50:17.14853');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (64, 'Петри Арт', 'Эпоксидная смола', 12, '2025-05-17 06:51:10.634723');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (61, 'Валяние', 'Войлок', 8, '2025-05-17 06:48:25.605079');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (54, 'Вязание', 'Спицами, крючком', 10, '2025-05-17 06:45:26.315316');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (49, 'Живопись', 'Акварель, маcсло, гуашь', 10, '2025-05-17 06:44:08.419658');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (51, 'Лепка из глины', 'Глина, обжиг, покраска', 11, '2025-05-17 06:44:48.035422');
INSERT INTO public.sections (id, name, description, max_participants, created_at) VALUES (58, 'Оригами', 'Бумага', 10, '2025-05-17 06:46:42.19386');


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (77, 'Соловьева  Наталья Владимировна', '78904566255', 'Soloveva235@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (73, 'Лебедев Михаил Сергеевич', '79898989898', 'LebedevMS@maik.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (74, 'Королёва Олеся Игоревна', '76565656565', 'oleciaI@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (68, 'Кошкина Марина Викторовна', '79023665897', 'KoshkinaMV@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (75, 'Пичугина Антонина Валерьевна', '78902456645', 'jfgkjdfgkj@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (76, 'Морковкин Игорь Константинович', '78956262222', 'morkovkin789@gmail.com', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (78, 'Полюшкина Полина Петровна', '78922455665', 'PolushkinaPP@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (79, 'Арбузов Николай Андреевич', '78955565656', 'arbus@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (71, 'Синицин Владимир Александрович', '75565655565', 'cinicinVA@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (72, 'Шишкина Виктория Геннадьевна', '78656565656', 'ShishkinaV@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (69, 'Иванов Федор Сергеевич', '78904566998', 'IvanovFS@mail.ru', NULL);
INSERT INTO public.teachers (id, full_name, phone, email, section_id) VALUES (70, 'Цветкова дарья Андреевна', '78946697532', 'Vvetkova11@mail.ru', NULL);


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (94, '2025-05-31', '09:16:00', 1.0, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (95, '2025-06-06', '09:19:00', 1.0, 57, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (97, '2025-06-01', '11:33:00', 1.0, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (96, '2025-05-31', '11:33:00', 1.5, 63, 72, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (98, '2025-05-31', '08:18:00', 1.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (99, '2025-05-30', '12:56:00', 1.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (100, '2025-05-23', '14:52:00', 1.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (101, '2025-05-31', '16:17:00', 2.0, 52, 71, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (102, '2025-05-31', '23:13:00', 1.5, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (82, '2025-06-01', '01:04:00', 1.0, 57, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (103, '2025-05-31', '00:17:00', 1.5, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (104, '2025-05-31', '23:48:00', 1.5, 57, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (91, '2025-05-24', '00:17:00', 1.0, 64, 77, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (105, '2025-06-08', '23:55:00', 2.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (76, '2025-05-30', '17:40:00', 1.0, 52, 68, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (106, '2025-05-31', '19:51:00', 2.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (80, '2025-05-29', '22:40:00', 1.5, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (107, '2025-05-23', '04:00:00', 2.0, 64, 77, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (72, '2025-05-25', '10:48:00', 1.5, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (108, '2025-05-24', '21:20:00', 1.0, 57, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (66, '2025-06-08', '03:10:00', 1.5, 57, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (73, '2025-05-24', '22:16:00', 2.0, 61, 78, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (67, '2025-06-01', '05:12:00', 1.5, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (78, '2025-05-24', '20:47:00', 1.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (69, '2025-05-31', '23:47:00', 1.0, 52, 71, 'busy');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (89, '2025-05-25', '21:12:00', 1.0, 49, 69, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (90, '2025-05-23', '20:12:00', 1.0, 51, 70, 'free');
INSERT INTO public.schedule (id, date, start_time, duration, section_id, teacher_id, status) VALUES (92, '2025-05-31', '01:15:00', 1.0, 52, 71, 'free');


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subscriptions (id, client_id, lesson_id, start_date, end_date, visit_count, used_visits) VALUES (3, 79, NULL, '2025-05-01', '2025-05-31', 4, 0);
INSERT INTO public.subscriptions (id, client_id, lesson_id, start_date, end_date, visit_count, used_visits) VALUES (5, 81, NULL, '2025-05-18', '2025-06-06', 4, 4);


--
-- Data for Name: records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (69, 69, 77, NULL, '2025-05-22 04:20:07.439492', ' ЄвЁў­®', NULL, 10);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (70, 69, 80, NULL, '2025-05-22 04:20:18.799392', ' ЄвЁў­®', NULL, 8);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (71, 69, 83, NULL, '2025-05-22 04:20:52.152623', ' ЄвЁў­®', NULL, 15);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (74, 91, 86, NULL, '2025-05-22 12:17:40.801319', ' ЄвЁў­®', NULL, 24);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (75, 66, 78, NULL, '2025-05-22 17:02:00.978236', ' ЄвЁў­®', NULL, 23);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (76, 69, 78, NULL, '2025-05-22 17:12:05.754595', ' ЄвЁў­®', NULL, 23);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (77, 67, 87, NULL, '2025-05-22 17:15:02.393763', ' ЄвЁў­®', NULL, 26);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (78, 72, 87, NULL, '2025-05-22 17:15:12.406319', ' ЄвЁў­®', NULL, 26);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (79, 66, 80, NULL, '2025-05-22 17:17:43.12619', ' ЄвЁў­®', NULL, 27);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (80, 73, 78, NULL, '2025-05-22 17:19:27.862315', ' ЄвЁў­®', NULL, 23);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (81, 67, 80, NULL, '2025-05-22 17:23:31.854858', ' ЄвЁў­®', NULL, 27);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (82, 78, 77, NULL, '2025-05-22 17:25:50.030551', ' ЄвЁў­®', NULL, 10);
INSERT INTO public.records (id, schedule_id, client_id, comment, created_at, status, subscription_id, abonim_id) VALUES (83, 69, 81, NULL, '2025-05-22 17:49:22.948088', ' ЄвЁў­®', NULL, 12);


--
-- Data for Name: teacher_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (73, 60);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (74, 59);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (74, 58);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (72, 63);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (75, 54);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (75, 61);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (75, 53);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (76, 49);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (72, 61);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (76, 57);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (78, 62);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (78, 61);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (79, 57);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (79, 63);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (69, 49);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (69, 57);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (70, 51);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (77, 56);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (77, 64);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (68, 52);
INSERT INTO public.teacher_sections (teacher_id, section_id) VALUES (71, 52);


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_sessions (sid, sess, expire) VALUES ('i73Wc6TnEVarau0pBEq_gjZhM4yJlvTx', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-05-29T14:46:45.343Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"isAuthenticated":true,"user":{"id":10,"username":"admin1","role":"admin","type":"main_admin"}}', '2025-05-29 18:20:14');
INSERT INTO public.user_sessions (sid, sess, expire) VALUES ('LHbtPEOMSBvUms236Xy1zb470kuQEoE_', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-05-21T00:27:11.065Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":10,"username":"admin1"},"isAuthenticated":true}', '2025-05-21 12:54:22');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, password, is_admin, role, type) VALUES (10, 'admin1', '$2a$10$NLpfcGRPLDk1XuW.pyYjceZePFvszEf8Hbj5RSN0YizltbzDKx7gm', true, 'admin', 'main_admin');
INSERT INTO public.users (id, username, password, is_admin, role, type) VALUES (14, 'admin2', '$2a$06$fx41Hs5efr1U6uSET6mHGuS4lw4BGcHBftJx.VBBDnwWcgzOwcBSC', false, 'admin', 'subadmin');


--
-- Name: abonims_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.abonims_id_seq', 27, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 90, true);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 2, true);


--
-- Name: records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.records_id_seq', 83, true);


--
-- Name: schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedule_id_seq', 108, true);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sections_id_seq', 85, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 5, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teachers_id_seq', 93, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- PostgreSQL database dump complete
--

