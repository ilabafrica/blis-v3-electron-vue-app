<template>
  <div>
		<v-dialog v-model="dialog" max-width="500px">
	    	<v-card>
		        <v-toolbar dark color="primary" class="elevation-0">
		        	<v-toolbar-title>Upload an Image</v-toolbar-title>
		        	<v-spacer></v-spacer>
		        	<v-btn round outline color="blue lighten-1" flat @click.native="dialog=false">
		            	Cancel
		            	<v-icon right dark>close</v-icon>
		          	</v-btn>
		        </v-toolbar>
		        <v-form ref="form" v-model="valid" lazy-validation>
			    	<v-card-text>
			        	<v-container grid-list-md>
				            <v-layout wrap>
				            	<v-flex xs12 sm12 md12>
					              	<img :src="imageUrl" height="150" v-if="imageUrl"/>
					                <v-text-field
					                  :rules="[v => !!v || 'File is required']"
					                  label="Select Image"
					                  @click='pickFile'
					                  v-model='imageName'
					                  prepend-icon='attach_file'>
					                </v-text-field>
					                <input
										type="file"
										style="display: none"
										ref="image"
										accept="image/*"
										@change="onFilePicked"
									>
				              	</v-flex>
				              	<v-flex xs3 offset-xs9 text-xs-right>
					            	<v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="submitFile">
					                	Save <v-icon right dark>cloud_upload</v-icon>
					              	</v-btn>
				              	</v-flex>
				            </v-layout>
			          	</v-container>
			        </v-card-text>
		        </v-form>
	      	</v-card>
	  	</v-dialog>
	    <v-tabs
	    	color="blue"
	      	dark
	      	slider-color="white">
	      	<v-tab
	        	ripple>
	        	Clinic Details
	      	</v-tab>
	      	<v-tab-item>
	        	<v-card flat>
	          		<v-layout>
							<v-flex xs6 sm6>
								<v-alert
									v-model="mainalert"
									outline
									align-right
									icon="done"
									transition="scale-transition"
									color="green"
									dismissible>
									{{message}}
								</v-alert>
								<v-card>
									<v-form ref="form" v-model="valid" lazy-validation>
										<v-card-text>
											<v-container grid-list-md>
												<v-layout wrap>
													<v-flex xs12 sm12 md12>
														<v-text-field
															v-model="editedItem.name"
															:rules="[v => !!v || 'Institution Name is Required']"
															label="Institution Name">
														</v-text-field>
													</v-flex>
													<v-flex xs12 sm12 md12>
														<v-text-field
															v-model="editedItem.email"
															:rules="[v => !!v || 'Email Address is Required']"
															label="Email Address">
														</v-text-field>
													</v-flex>
													<v-flex xs12 sm12 md12>
														<v-text-field
															v-model="editedItem.phone"
															:rules="[v => !!v || 'Telephone Number is Required']"
															label="Tel">
														</v-text-field>
													</v-flex>
													<v-flex xs3 offset-xs9 text-xs-right>
														<v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
															Save <v-icon right dark>cloud_upload</v-icon>
														</v-btn>
													</v-flex>
												</v-layout>
											</v-container>
										</v-card-text>
										<v-card-actions>
										</v-card-actions>
									</v-form>
								</v-card>
							</v-flex>
							&nbsp &nbsp
							<v-flex xs6 sm6>
									<v-card>
										<img
											position
											:src="home_url+'/storage/profile_pictures/'+editedItem.logo"
											height = "320"
											width = "420"
										/>
										<v-card-actions>
											<v-btn flat color="blue" @click.native="upload">Upload</v-btn>
											<v-btn flat color="blue" @click.native="removePic">Remove</v-btn>
										</v-card-actions>
									</v-card>
							</v-flex>
						</v-layout>
	        </v-card>
	      	</v-tab-item>
		    <v-tab
		    	ripple
		    >
		    	Address Information
		    </v-tab>
		  	<v-tab-item>
		    	<v-card flat>
		        	<v-layout>
						<v-flex xs6 sm6 offset-sm3>
							<v-card>
								<v-form ref="form" v-model="valid" lazy-validation>
									<v-card-text>
										<v-container grid-list-md>
											<v-layout wrap>
												<v-alert
													v-model="alert"
													outline
													align-right
													icon="warning"
													transition="scale-transition"
													color="error"
													dismissible>
													{{message}}
												</v-alert>
												<v-alert
													v-model="successalert"
													outline
													align-right
													icon="done"
													transition="scale-transition"
													color="green"
													dismissible>
													{{message}}
												</v-alert>
												<v-flex xs6 sm6 md6>
													<v-text-field
														v-model="editedItem.post"
															:rules="[v => !!v || 'P.O. Box is Required']"
															label="P.O. Box">
													></v-text-field>
												</v-flex>
												<v-flex xs6 sm6 md6>
													<v-text-field
														v-model="editedItem.code"
															:rules="[v => !!v || 'Code is Required']"
															label="Code">
													></v-text-field>
												</v-flex>
												<v-flex xs12 sm12 md12>
													<v-text-field
														v-model="editedItem.address"
															:rules="[v => !!v || 'Address is Required']"
															label="Address">
													></v-text-field>
												</v-flex>
												<v-flex xs3 offset-xs9 text-xs-right>
													<v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
														Save <v-icon right dark>cloud_upload</v-icon>
													</v-btn>
												</v-flex>
											</v-layout>
										</v-container>
									</v-card-text>
								</v-form>
							</v-card>
						</v-flex>
					</v-layout>
		        </v-card>
		    </v-tab-item>
	    </v-tabs> 	
  	</div>
</template>

<script>
  import apiCall from '../../utils/api'
  export default {
  name: "Profile",
  data: () => ({
    dialog: false,
    mainalert: false,
    alert: false,
    successalert: false,
    valid: true,
    message: "",
    removePicture: false,
    imageName: "",
    imageUrl: "",
    imageFile: "",
    rules: {
      required: value => !!value || "Required.",
    },
    editedItem: []
  }),
  computed:{
  	home_url:()=>{
  		return process.env.VUE_APP_API_URL
  	}
  },

  methods: {
    initialize() {
      apiCall({ url: "/api/generalconfiguration", method: "GET" })
        .then(resp => {
          console.log(resp);
          this.editedItem = resp;
          if (resp.logo == null) {
            this.editedItem.logo = "default.png";
          }
        })
        .catch(error => {
          console.log(error.response);
        });
    },

    upload() {
      this.dialog = true;
    },

    removePic() {
      this.removePicture = true;
      this.editedItem.removePic = true;
      this.save();
    },

    pickFile() {
      this.$refs.image.click();
    },

    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.imageName = files[0].name;
        if (this.imageName.lastIndexOf(".") <= 0) {
          return;
        }
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
          this.imageUrl = fr.result;
          this.imageFile = files[0]; // this is an image file that can be sent to server...
        });
      } else {
        this.imageName = "";
        this.imageFile = "";
        this.imageUrl = "";
      }
    },

    submitFile() {
      let formData = new FormData();
      formData.append("id", this.editedItem.id);
      formData.append("name", this.imageName);
      formData.append("file", this.imageFile);
      const config = {
        headers: { "content-type": "multipart/form-data" }
      };
      console.log(formData);
      apiCall({
        url: "/api/generalconfiguration/image",
        data: formData,
        config,
        method: "POST"
      })
        .then(resp => {
          console.log(resp);
          this.editedItem.profile_picture = resp.profile_picture;
          this.dialog = false;
          this.imageName = "";
          this.imageFile = "";
          this.imageUrl = "";
          this.mainalert = true;
          this.message = "Clinic Updated Successfully";
        })
        .catch(error => {
          /*this.message = 'The current password is incorrect';
            	this.alert = true;*/
        });
    },

    editItem (item) {
        this.editedIndex = this.user.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true       
    },

    save() {
        apiCall({
          url: "/api/generalconfiguration/" + this.editedItem.id, data: this.editedItem, method: 'PUT'})
          .then(resp => {
            Object.assign(this.editedItem);
            console.log(resp);
            if (this.removePicture) {
              this.editedItem.profile_picture = "default.png";
              this.removePicture = false;
            }
            this.mainalert = true;
            this.message = "Clinic Updated Successfully";
          })
          .catch(error => {
            console.log("error", error);
          });
    }
  },

  created() {
    this.initialize();
  }
}
</script>