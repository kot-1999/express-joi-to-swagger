import { forEach } from 'lodash'
import { Express } from 'express'
import path from 'path'
import fs from 'fs'
import generateUi from './ui'
import parser, { IConfig } from './parser'
import { getPathSwagger, getSwaggerSchema } from './baseSwagger'

const getSwagger = async (app: Express, config: IConfig) => {
	const endpoints = await parser(app, config)

	let resultSwagger = {}
	forEach(endpoints, (endpoint) => {
		resultSwagger = {
			...resultSwagger,
			...getPathSwagger(endpoint, config)
		}
	})

	const result = getSwaggerSchema(resultSwagger, config)
	const outputPath = config.outputPath || process.cwd()
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath)
	}
	if (config.generateUI) {
		await generateUi(outputPath, config)
	}

	await new Promise((resolve, reject) => {
		// Create a new directory with archive if not exists
		const archivePath = path.join(outputPath, 'archive')
		if (!fs.existsSync(archivePath)) {
			fs.mkdirSync(archivePath)
		}

		// Write a new version or overwrite the old one
		fs.writeFile(path.join(archivePath, `3${result.info.version}.json`), JSON.stringify(result, null, '\t'), (err) => {
			if (err) {
				return reject(err)
			}
			return resolve(true)
		})

		fs.writeFile(path.join(archivePath, `2${result.info.version}.json`), JSON.stringify(result, null, '\t'), (err) => {
			if (err) {
				return reject(err)
			}
			return resolve(true)
		})

		// Update archive.json

		fs.readdir(archivePath, (err, files) => {
			if (err) {
				return reject(err)
			}
			const archive: { urls: { name: string; url: string }[]; specName: string } = { urls: [], specName: '' }

			files.forEach((file: string) => {
				archive.urls.push({
					name: file.replace('.json', ''),
					url: `archive/${file}`
				})
			})

			archive.specName = archive.urls.sort((a, b) => a.name.localeCompare(b.name))[archive.urls.length - 1].name

			fs.writeFile(path.join(__dirname, 'ui', `archive.json`), JSON.stringify(archive, null, '\t'), (error) => {
				if (error) {
					return reject(error)
				}
				return resolve(true)
			})
			return resolve(true)
		})
	})
}

export default getSwagger
