import { forEach } from 'lodash'
import SwaggerUI from 'swagger-ui'
import 'swagger-ui/dist/swagger-ui.css'

import spec from './data.json'

const AdvancedFilterPlugin = (system) => ({
	fn: {
		opsFilter: (taggedOps, phrase) => {
			const normPhrase = phrase.toLowerCase()
			const normalTaggedOps = JSON.parse(JSON.stringify(taggedOps))
			forEach(normalTaggedOps, (tagObj, key) => {
				const path = tagObj.operations[0].path.toLowerCase().indexOf(normPhrase) !== -1
				const tags = tagObj.operations[0].operation.tags.filter((tag) => tag.toLowerCase().indexOf(normPhrase) !== -1)
				if (!path && tags.length <= 0) {
					delete normalTaggedOps[key]
				}
			})
			return system.Im.fromJS(normalTaggedOps)
		}
	}
})

SwaggerUI({
	spec,
	dom_id: '#swagger',
	filter: true,
	plugins: [AdvancedFilterPlugin]
})
