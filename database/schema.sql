-- Додамо процесор
INSERT INTO public.components (name, type)
VALUES ('Intel Core i5-12400F', 'CPU');

-- Додамо відеокарту
INSERT INTO public.components (name, type)
VALUES ('NVIDIA GeForce RTX 3060', 'GPU');

-- Додамо оперативну памʼять
INSERT INTO public.components (name, type)
VALUES ('Kingston Fury 16GB DDR4 3200MHz', 'RAM');

-- Додамо материнську плату
INSERT INTO public.components (name, type)
VALUES ('ASUS TUF B660-PLUS WiFi D4', 'Motherboard');

-- Вивід таблиць
SELECT * FROM public.components ORDER BY id ASC;

-- Перевірка чи є дублікати
SELECT name, type, COUNT(*) 
FROM public.components
GROUP BY name, type
HAVING COUNT(*) > 1;

--
INSERT INTO public.components (name, type) VALUES
('Samsung 970 EVO Plus 1TB NVMe', 'SSD'),
('Kingston A400 480GB SATA', 'SSD'),
('Corsair RM750x', 'PSU'),
('Deepcool PK550D', 'PSU'),
('NZXT H510', 'Case'),
('Fractal Design Meshify C', 'Case');






