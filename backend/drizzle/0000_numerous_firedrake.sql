CREATE TABLE `consumos` (
	`id` varchar(36) NOT NULL,
	`unidade_id` varchar(36) NOT NULL,
	`consumo_fora_ponta_em_kwh` decimal(10,2) NOT NULL,
	`mes_do_consumo` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consumos_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_unidade_mes` UNIQUE(`unidade_id`,`mes_do_consumo`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` varchar(36) NOT NULL,
	`nome_completo` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `unidades` (
	`id` varchar(36) NOT NULL,
	`lead_id` varchar(36) NOT NULL,
	`codigo_da_unidade_consumidora` varchar(50) NOT NULL,
	`modelo_fasico` enum('monofasico','bifasico','trifasico') NOT NULL,
	`enquadramento` enum('AX','B1','B2','B3') NOT NULL,
	`consumo_em_reais` decimal(10,2) NOT NULL,
	`mes_de_referencia` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `unidades_id` PRIMARY KEY(`id`),
	CONSTRAINT `unidades_codigo_da_unidade_consumidora_unique` UNIQUE(`codigo_da_unidade_consumidora`)
);
--> statement-breakpoint
ALTER TABLE `consumos` ADD CONSTRAINT `consumos_unidade_id_unidades_id_fk` FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `unidades` ADD CONSTRAINT `unidades_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE cascade ON UPDATE no action;